import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import { Env } from '../../config/env.validation';

export const AUTH_COOKIE_NAME = 'access_token';

@Injectable()
export class AuthCookieService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  set(response: Response, token: string): void {
    response.cookie(AUTH_COOKIE_NAME, token, {
      ...this.baseOptions(),
      maxAge: this.config.get('JWT_EXPIRES_IN_SECONDS', { infer: true }) * 1000,
    });
  }

  clear(response: Response): void {
    response.clearCookie(AUTH_COOKIE_NAME, this.baseOptions());
  }

  private baseOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'strict',
      secure: this.config.get('COOKIE_SECURE', { infer: true }),
      path: '/',
    };
  }
}
