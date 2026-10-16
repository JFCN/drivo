import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Patch,
  Put,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthCookieService } from '../common/security/auth-cookie.service';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { MAX_AVATAR_SIZE, UploadedAvatar, UsersService } from './users.service';

@ApiTags('users')
@ApiCookieAuth('access_token')
@ApiUnauthorizedResponse({ description: 'Sessão ausente ou expirada' })
@Controller('users/me')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authCookie: AuthCookieService,
  ) {}

  @Get()
  @ApiOkResponse({ type: UserResponseDto })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return UserResponseDto.fromEntity(await this.usersService.findById(user.id));
  }

  @Patch()
  @ApiOkResponse({ type: UserResponseDto })
  @ApiConflictResponse({ description: 'E-mail já está em uso' })
  async updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto): Promise<UserResponseDto> {
    return UserResponseDto.fromEntity(await this.usersService.updateProfile(user.id, dto));
  }

  @Patch('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Senha alterada' })
  @ApiBadRequestResponse({ description: 'Senha atual incorreta ou nova senha inválida' })
  async changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto): Promise<void> {
    await this.usersService.changePassword(user.id, dto);
  }

  @Get('avatar')
  @Header('Cache-Control', 'private, max-age=604800, immutable')
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  @ApiOkResponse({ description: 'Foto de perfil' })
  @ApiNotFoundResponse({ description: 'Usuário sem foto' })
  async avatar(@CurrentUser() user: AuthenticatedUser): Promise<StreamableFile> {
    const avatar = await this.usersService.getAvatar(user.id);
    return new StreamableFile(Buffer.from(avatar.data), { type: avatar.mimeType });
  }

  @Put('avatar')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_AVATAR_SIZE, files: 1 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary', description: 'JPG, PNG ou WEBP até 2 MB' } },
    },
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Arquivo ausente, grande demais ou em formato não suportado' })
  async uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: UploadedAvatar | undefined,
  ): Promise<UserResponseDto> {
    return UserResponseDto.fromEntity(await this.usersService.setAvatar(user.id, file));
  }

  @Delete('avatar')
  @ApiOkResponse({ type: UserResponseDto })
  async removeAvatar(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return UserResponseDto.fromEntity(await this.usersService.removeAvatar(user.id));
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Conta e veículos excluídos' })
  async remove(@CurrentUser() user: AuthenticatedUser, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.usersService.remove(user.id);
    this.authCookie.clear(response);
  }
}
