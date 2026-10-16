import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PasswordHasher } from '../common/security/password-hasher';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const user: User = {
  id: 'user-1',
  firstName: 'Mariana',
  lastName: 'Costa',
  email: 'mariana@email.com',
  passwordHash: 'hashed',
  createdAt: new Date('2026-03-01'),
  updatedAt: new Date('2026-03-01'),
};

describe('AuthService', () => {
  let usersService: { create: jest.Mock; findByEmail: jest.Mock };
  let passwordHasher: { hash: jest.Mock; compare: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    usersService = { create: jest.fn(), findByEmail: jest.fn() };
    passwordHasher = { hash: jest.fn().mockResolvedValue('hashed'), compare: jest.fn() };
    const jwtService = { signAsync: jest.fn().mockResolvedValue('token') };
    service = new AuthService(
      usersService as unknown as UsersService,
      passwordHasher as unknown as PasswordHasher,
      jwtService as unknown as JwtService,
    );
  });

  it('cadastra o usuário com a senha criptografada', async () => {
    usersService.create.mockResolvedValue(user);

    const result = await service.register({ name: 'Mariana Costa', email: user.email, password: 'senha12345' });

    expect(usersService.create).toHaveBeenCalledWith({
      firstName: 'Mariana',
      lastName: 'Costa',
      email: user.email,
      passwordHash: 'hashed',
    });
    expect(result).toEqual({ user, token: 'token' });
  });

  it('recusa login com senha incorreta', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(service.login({ email: user.email, password: 'errada123' })).rejects.toThrow(UnauthorizedException);
  });
});
