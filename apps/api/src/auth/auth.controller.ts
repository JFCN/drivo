import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { AuthCookieService } from '../common/security/auth-cookie.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const AUTH_THROTTLE = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookie: AuthCookieService,
  ) {}

  @Post('register')
  @Throttle(AUTH_THROTTLE)
  @ApiCreatedResponse({ type: UserResponseDto, description: 'Conta criada e sessão iniciada via cookie httpOnly' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({ description: 'E-mail já está em uso' })
  @ApiTooManyRequestsResponse({ description: 'Muitas tentativas' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response): Promise<UserResponseDto> {
    const { user, token } = await this.authService.register(dto);
    this.authCookie.set(response, token);
    return UserResponseDto.fromEntity(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle(AUTH_THROTTLE)
  @ApiOkResponse({ type: UserResponseDto, description: 'Sessão iniciada via cookie httpOnly' })
  @ApiUnauthorizedResponse({ description: 'E-mail ou senha incorretos' })
  @ApiTooManyRequestsResponse({ description: 'Muitas tentativas' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<UserResponseDto> {
    const { user, token } = await this.authService.login(dto);
    this.authCookie.set(response, token);
    return UserResponseDto.fromEntity(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Sessão encerrada' })
  logout(@Res({ passthrough: true }) response: Response): void {
    this.authCookie.clear(response);
  }
}
