import { Global, Module } from '@nestjs/common';
import { AuthCookieService } from './auth-cookie.service';
import { PasswordHasher } from './password-hasher';

@Global()
@Module({
  providers: [PasswordHasher, AuthCookieService],
  exports: [PasswordHasher, AuthCookieService],
})
export class SecurityModule {}
