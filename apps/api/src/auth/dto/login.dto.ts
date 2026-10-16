import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'mariana.costa@email.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Digite um e-mail válido' })
  email: string;

  @ApiProperty({ example: 'senhaForte123' })
  @IsString()
  @MinLength(1, { message: 'Informe sua senha' })
  password: string;
}
