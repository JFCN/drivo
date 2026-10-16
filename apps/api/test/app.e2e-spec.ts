import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { GeminiCrlvReader } from '../src/crlv/gemini-crlv.reader';
import { PrismaService } from '../src/prisma/prisma.service';
import { VehiclePhotoService } from '../src/vehicles/photos/vehicle-photo.service';

const vehiclePayload = {
  plate: 'RTX-4B21',
  renavam: '01234567890',
  chassis: '9BRBC3E31P4821000',
  brand: 'Toyota',
  model: 'Corolla Altis Hybrid',
  manufactureYear: 2022,
  modelYear: 2023,
  color: 'Prata',
  fuel: 'HYBRID',
  type: 'CAR',
};

const crlvAnswer = {
  isCrlv: true,
  plate: 'QPL8C34',
  renavam: '13579246801',
  chassis: '93HRV2850PZ200193',
  brand: 'Honda',
  model: 'HR-V EXL Turbo',
  manufactureYear: '2023',
  modelYear: '2024',
  color: 'PRETO',
  fuel: 'FLEX',
  type: 'CAR',
};

const readCookie = (response: request.Response): string => {
  const header = response.headers['set-cookie'] as unknown as string[] | undefined;
  const cookie = header?.find((value) => value.startsWith('access_token='));
  if (!cookie) {
    throw new Error('Cookie de sessão não foi definido');
  }
  return cookie.split(';')[0];
};

describe('Drivo API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const reader = { read: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(GeminiCrlvReader)
      .useValue(reader)
      .overrideProvider(VehiclePhotoService)
      .useValue({ refresh: jest.fn().mockResolvedValue(undefined) })
      .compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app as NestExpressApplication);
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  const register = async (email: string): Promise<string> => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Mariana Costa', email, password: 'senha12345' })
      .expect(201);

    expect(response.headers['set-cookie']?.[0]).toContain('HttpOnly');
    return readCookie(response);
  };

  it('bloqueia rotas privadas sem sessão', async () => {
    await request(app.getHttpServer()).get('/api/vehicles').expect(401);
  });

  it('percorre o fluxo completo da garagem', async () => {
    const server = app.getHttpServer();
    const cookie = await register('mariana@email.com');

    const me = await request(server).get('/api/users/me').set('Cookie', cookie).expect(200);
    expect(me.body).toMatchObject({ firstName: 'Mariana', lastName: 'Costa', email: 'mariana@email.com' });
    expect(me.body).not.toHaveProperty('passwordHash');

    const empty = await request(server).get('/api/vehicles').set('Cookie', cookie).expect(200);
    expect(empty.body).toEqual({ data: [], total: 0 });

    const created = await request(server).post('/api/vehicles').set('Cookie', cookie).send(vehiclePayload).expect(201);
    expect(created.body.plate).toBe('RTX4B21');

    await request(server).post('/api/vehicles').set('Cookie', cookie).send(vehiclePayload).expect(409);

    reader.read.mockResolvedValue(JSON.stringify(crlvAnswer));
    const extracted = await request(server)
      .post('/api/crlv/extract')
      .set('Cookie', cookie)
      .attach('file', Buffer.from('%PDF-1.7 crlv'), { filename: 'crlv.pdf', contentType: 'application/pdf' })
      .expect(200);
    expect(extracted.body).toMatchObject({ plate: 'QPL8C34', color: 'Preto', manufactureYear: 2023, fuel: 'FLEX' });

    const { plate, renavam, chassis, brand, model, manufactureYear, modelYear, color, fuel, type } = extracted.body;
    await request(server)
      .post('/api/vehicles')
      .set('Cookie', cookie)
      .send({ plate, renavam, chassis, brand, model, manufactureYear, modelYear, color, fuel, type })
      .expect(201);

    const search = await request(server).get('/api/vehicles').query({ search: 'hr-v' }).set('Cookie', cookie).expect(200);
    expect(search.body.total).toBe(1);
    expect(search.body.data[0].model).toBe('HR-V EXL Turbo');

    const all = await request(server).get('/api/vehicles').set('Cookie', cookie).expect(200);
    expect(all.body.data.map((vehicle: { plate: string }) => vehicle.plate)).toEqual(['QPL8C34', 'RTX4B21']);

    const secondPage = await request(server).get('/api/vehicles').query({ offset: 1, limit: 5 }).set('Cookie', cookie).expect(200);
    expect(secondPage.body.total).toBe(2);
    expect(secondPage.body.data.map((vehicle: { plate: string }) => vehicle.plate)).toEqual(['RTX4B21']);

    const updated = await request(server)
      .patch(`/api/vehicles/${created.body.id}`)
      .set('Cookie', cookie)
      .send({ nickname: 'Carro da família' })
      .expect(200);
    expect(updated.body.nickname).toBe('Carro da família');

    await request(server).delete(`/api/vehicles/${created.body.id}`).set('Cookie', cookie).expect(204);
    await request(server).get(`/api/vehicles/${created.body.id}`).set('Cookie', cookie).expect(404);
  });

  it('isola os veículos entre usuários', async () => {
    const server = app.getHttpServer();
    const owner = await register('dono@email.com');
    const intruder = await register('intruso@email.com');

    const created = await request(server).post('/api/vehicles').set('Cookie', owner).send(vehiclePayload).expect(201);

    await request(server).get(`/api/vehicles/${created.body.id}`).set('Cookie', intruder).expect(404);
    await request(server).patch(`/api/vehicles/${created.body.id}`).set('Cookie', intruder).send({ color: 'Azul' }).expect(404);
    await request(server).delete(`/api/vehicles/${created.body.id}`).set('Cookie', intruder).expect(404);

    const intruderList = await request(server).get('/api/vehicles').set('Cookie', intruder).expect(200);
    expect(intruderList.body).toEqual({ data: [], total: 0 });
  });

  it('altera perfil e senha e encerra a sessão', async () => {
    const server = app.getHttpServer();
    const cookie = await register('perfil@email.com');

    await request(server)
      .patch('/api/users/me')
      .set('Cookie', cookie)
      .send({ firstName: 'Mari', lastName: 'Costa', email: 'mariana@email.com' })
      .expect(409);

    const profile = await request(server)
      .patch('/api/users/me')
      .set('Cookie', cookie)
      .send({ firstName: 'Mari', lastName: 'Costa Silva', email: 'perfil@email.com' })
      .expect(200);
    expect(profile.body.firstName).toBe('Mari');

    await request(server)
      .patch('/api/users/me/password')
      .set('Cookie', cookie)
      .send({ currentPassword: 'senha12345', newPassword: 'novaSenha99' })
      .expect(204);

    await request(server).post('/api/auth/login').send({ email: 'perfil@email.com', password: 'senha12345' }).expect(401);
    await request(server).post('/api/auth/login').send({ email: 'perfil@email.com', password: 'novaSenha99' }).expect(200);

    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );
    const withAvatar = await request(server)
      .put('/api/users/me/avatar')
      .set('Cookie', cookie)
      .attach('file', png, { filename: 'eu.png', contentType: 'image/png' })
      .expect(200);
    expect(withAvatar.body.avatarUrl).toMatch(/^\/api\/users\/me\/avatar\?v=\d+$/);
    await request(server).get('/api/users/me/avatar').set('Cookie', cookie).expect(200).expect('Content-Type', 'image/png');
    const withoutAvatar = await request(server).delete('/api/users/me/avatar').set('Cookie', cookie).expect(200);
    expect(withoutAvatar.body.avatarUrl).toBeNull();

    const logout = await request(server).post('/api/auth/logout').expect(204);
    expect(logout.headers['set-cookie']?.[0]).toContain('access_token=;');
  });

  it('exclui a conta junto com os veículos', async () => {
    const server = app.getHttpServer();
    const cookie = await register('excluir@email.com');
    await request(server).post('/api/vehicles').set('Cookie', cookie).send(vehiclePayload).expect(201);

    await request(server).delete('/api/users/me').set('Cookie', cookie).expect(204);

    const user = await prisma.user.findUnique({ where: { email: 'excluir@email.com' } });
    expect(user).toBeNull();
    await request(server).get('/api/users/me').set('Cookie', cookie).expect(404);
  });
});
