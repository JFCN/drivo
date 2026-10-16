import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User, UserAvatar } from '@prisma/client';
import { matchesSignature } from '../common/files/file-signature';
import { PasswordHasher } from '../common/security/password-hasher';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
};

export type UploadedAvatar = {
  buffer: Buffer;
  mimetype: string;
  size: number;
};

export const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const WITH_AVATAR = { avatar: { select: { updatedAt: true } } } satisfies Prisma.UserInclude;

export type UserWithAvatar = Prisma.UserGetPayload<{ include: typeof WITH_AVATAR }>;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<UserWithAvatar> {
    const user = await this.prisma.user.findUnique({ where: { id }, include: WITH_AVATAR });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async create(input: CreateUserInput): Promise<User> {
    await this.ensureEmailAvailable(input.email);
    return this.prisma.user.create({ data: input });
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<UserWithAvatar> {
    const user = await this.findById(id);
    if (dto.email !== user.email) {
      await this.ensureEmailAvailable(dto.email);
    }

    return this.prisma.user.update({
      where: { id },
      data: { firstName: dto.firstName, lastName: dto.lastName, email: dto.email },
      include: WITH_AVATAR,
    });
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(id);
    const matches = await this.passwordHasher.compare(dto.currentPassword, user.passwordHash);
    if (!matches) {
      throw new BadRequestException('Senha atual incorreta');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('A nova senha deve ser diferente da atual');
    }

    const passwordHash = await this.passwordHasher.hash(dto.newPassword);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async setAvatar(id: string, file: UploadedAvatar | undefined): Promise<UserWithAvatar> {
    if (!file) {
      throw new BadRequestException('Envie a imagem no campo "file"');
    }
    if (file.size > MAX_AVATAR_SIZE) {
      throw new BadRequestException('A foto deve ter no máximo 2 MB');
    }
    if (!ALLOWED_AVATAR_TYPES.includes(file.mimetype) || !matchesSignature(file.mimetype, file.buffer)) {
      throw new BadRequestException('Formato não suportado. Envie JPG, PNG ou WEBP');
    }

    await this.findById(id);
    const data = { data: new Uint8Array(file.buffer), mimeType: file.mimetype };
    await this.prisma.userAvatar.upsert({ where: { userId: id }, create: { userId: id, ...data }, update: data });
    return this.findById(id);
  }

  async removeAvatar(id: string): Promise<UserWithAvatar> {
    await this.prisma.userAvatar.deleteMany({ where: { userId: id } });
    return this.findById(id);
  }

  async getAvatar(id: string): Promise<UserAvatar> {
    const avatar = await this.prisma.userAvatar.findUnique({ where: { userId: id } });
    if (!avatar) {
      throw new NotFoundException('Foto não encontrada');
    }
    return avatar;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.user.delete({ where: { id } });
  }

  private async ensureEmailAvailable(email: string): Promise<void> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Este e-mail já está em uso');
    }
  }
}
