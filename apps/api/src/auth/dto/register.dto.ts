import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';
import { PASSWORD_PATTERN, trimString } from '../../common/validation/patterns';

export class RegisterDto {
  @ApiProperty({ example: 'Mariana Costa' })
  @Transform(trimString)
  @IsString()
  @Length(2, 140, { message: 'Informe seu nome completo' })
  name: string;

  @ApiProperty({ example: 'mariana.costa@email.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Digite um e-mail válido' })
  @MaxLength(120)
  email: string;

  @ApiProperty({ minLength: 8, maxLength: 72, example: 'senhaForte123' })
  @IsString()
  @Length(8, 72, { message: 'A senha deve ter entre 8 e 72 caracteres' })
  @Matches(PASSWORD_PATTERN, { message: 'A senha deve combinar letras e números' })
  password: string;
}
