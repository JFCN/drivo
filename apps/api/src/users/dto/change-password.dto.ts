import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, MinLength } from 'class-validator';
import { PASSWORD_PATTERN } from '../../common/validation/patterns';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Informe a senha atual' })
  currentPassword: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @Length(8, 72, { message: 'A nova senha deve ter entre 8 e 72 caracteres' })
  @Matches(PASSWORD_PATTERN, { message: 'A nova senha deve combinar letras e números' })
  newPassword: string;
}
