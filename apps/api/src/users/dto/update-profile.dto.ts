import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, MaxLength } from 'class-validator';
import { trimString } from '../../common/validation/patterns';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Mariana' })
  @Transform(trimString)
  @IsString()
  @Length(1, 60, { message: 'Nome deve ter entre 1 e 60 caracteres' })
  firstName: string;

  @ApiProperty({ example: 'Costa' })
  @Transform(trimString)
  @IsString()
  @MaxLength(80, { message: 'Sobrenome deve ter no máximo 80 caracteres' })
  lastName: string;

  @ApiProperty({ example: 'mariana.costa@email.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Digite um e-mail válido' })
  @MaxLength(120)
  email: string;
}
