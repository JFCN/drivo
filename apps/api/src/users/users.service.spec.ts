import { BadRequestException, ConflictException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PasswordHasher } from '../common/security/password-hasher';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

const user: User = {
  id: 'user-1',
  firstName: 'Mariana',
  lastName: 'Costa',
  email: 'mariana@email.com',
  passwordHash: 'hashed-atual',
  createdAt: new Date('2026-03-01'),
  updatedAt: new Date('2026-03-01'),
};

describe('UsersService', () => {
  let prisma: { user: { findUnique: jest.Mock; update: jest.Mock } };
  let passwordHasher: { hash: jest.Mock; compare: jest.Mock };
  let service: UsersService;

  beforeEach(() => {
    prisma = { user: { findUnique: jest.fn(), update: jest.fn() } };
    passwordHasher = { hash: jest.fn().mockResolvedValue('hashed-nova'), compare: jest.fn() };
    service = new UsersService(prisma as unknown as PrismaService, passwordHasher as unknown as PasswordHasher);
  });

  it('atualiza os dados cadastrais', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue({ ...user, firstName: 'Mari' });

    const result = await service.updateProfile(user.id, { firstName: 'Mari', lastName: 'Costa', email: user.email });

    expect(result.firstName).toBe('Mari');
  });

  it('impede trocar para um e-mail de outra conta', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(user).mockResolvedValueOnce({ ...user, id: 'outro' });

    await expect(
      service.updateProfile(user.id, { firstName: 'Mariana', lastName: 'Costa', email: 'outro@email.com' }),
    ).rejects.toThrow(ConflictException);
  });

  it('altera a senha quando a senha atual confere', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(true);

    await service.changePassword(user.id, { currentPassword: 'senha12345', newPassword: 'nova12345' });

    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: user.id }, data: { passwordHash: 'hashed-nova' } });
  });

  it('recusa a troca de senha quando a senha atual está errada', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      service.changePassword(user.id, { currentPassword: 'errada', newPassword: 'nova12345' }),
    ).rejects.toThrow(BadRequestException);
  });
});
