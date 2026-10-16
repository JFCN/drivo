import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PasswordHasher } from '../common/security/password-hasher';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export type AuthResult = {
  user: User;
  token: string;
};

export type JwtPayload = {
  sub: string;
};

export const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const passwordHash = await this.passwordHasher.hash(dto.password);
    const user = await this.usersService.create({
      ...splitFullName(dto.name),
      email: dto.email,
      passwordHash,
    });

    return { user, token: await this.signToken(user.id) };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    const matches = user ? await this.passwordHasher.compare(dto.password, user.passwordHash) : false;

    if (!user || !matches) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    return { user, token: await this.signToken(user.id) };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token);
  }

  private signToken(userId: string): Promise<string> {
    const payload: JwtPayload = { sub: userId };
    return this.jwtService.signAsync(payload);
  }
}
