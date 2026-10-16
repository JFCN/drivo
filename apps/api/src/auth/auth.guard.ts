import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import { AUTH_COOKIE_NAME } from '../common/security/auth-cookie.service';
import { AuthenticatedRequest } from '../common/types/authenticated-request';
import { AuthService } from './auth.service';

const extractToken = (request: Request): string | undefined => {
  const fromCookie: unknown = request.cookies?.[AUTH_COOKIE_NAME];
  if (typeof fromCookie === 'string' && fromCookie !== '') {
    return fromCookie;
  }

  const [scheme, value] = request.headers.authorization?.split(' ') ?? [];
  return scheme === 'Bearer' && value ? value : undefined;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Sessão não encontrada');
    }

    try {
      const payload = await this.authService.verifyToken(token);
      request.user = { id: payload.sub };
      return true;
    } catch {
      throw new UnauthorizedException('Sessão expirada, entre novamente');
    }
  }
}
