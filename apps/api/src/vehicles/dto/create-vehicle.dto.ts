import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Fuel, VehicleType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Length, Matches, Max, MaxLength, Min } from 'class-validator';
import {
  CHASSIS_PATTERN,
  normalizeChassis,
  normalizePlate,
  normalizeRenavam,
  PLATE_PATTERN,
  RENAVAM_PATTERN,
  trimString,
} from '../../common/validation/patterns';

export const MIN_VEHICLE_YEAR = 1900;
export const maxVehicleYear = (): number => new Date().getFullYear() + 1;

const asString = (normalize: (value: string) => string) =>
  ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? normalize(value) : value);

export class CreateVehicleDto {
  @ApiProperty({ example: 'RTX4B21', description: 'Placa antiga (ABC1234) ou Mercosul (ABC1D23)' })
  @Transform(asString(normalizePlate))
  @IsString()
  @Matches(PLATE_PATTERN, { message: 'Placa inválida' })
  plate: string;

  @ApiProperty({ example: '01234567890' })
  @Transform(asString(normalizeRenavam))
  @IsString()
  @Matches(RENAVAM_PATTERN, { message: 'Renavam deve ter 11 dígitos' })
  renavam: string;

  @ApiProperty({ example: '9BRBC3E31P4821000' })
  @Transform(asString(normalizeChassis))
  @IsString()
  @Matches(CHASSIS_PATTERN, { message: 'Chassi deve ter 17 caracteres (sem I, O ou Q)' })
  chassis: string;

  @ApiProperty({ example: 'Toyota' })
  @Transform(trimString)
  @IsString()
  @Length(1, 60, { message: 'Informe a marca' })
  brand: string;

  @ApiProperty({ example: 'Corolla Altis Hybrid' })
  @Transform(trimString)
  @IsString()
  @Length(1, 80, { message: 'Informe o modelo' })
  model: string;

  @ApiProperty({ example: 2022 })
  @Type(() => Number)
  @IsInt({ message: 'Ano de fabricação inválido' })
  @Min(MIN_VEHICLE_YEAR, { message: 'Ano de fabricação inválido' })
  @Max(maxVehicleYear(), { message: 'Ano de fabricação inválido' })
  manufactureYear: number;

  @ApiProperty({ example: 2023 })
  @Type(() => Number)
  @IsInt({ message: 'Ano do modelo inválido' })
  @Min(MIN_VEHICLE_YEAR, { message: 'Ano do modelo inválido' })
  @Max(maxVehicleYear() + 1, { message: 'Ano do modelo inválido' })
  modelYear: number;

  @ApiProperty({ example: 'Prata' })
  @Transform(trimString)
  @IsString()
  @Length(1, 30, { message: 'Informe a cor' })
  color: string;

  @ApiProperty({ enum: Fuel, example: Fuel.HYBRID })
  @IsEnum(Fuel, { message: 'Combustível inválido' })
  fuel: Fuel;

  @ApiProperty({ enum: VehicleType, example: VehicleType.CAR })
  @IsEnum(VehicleType, { message: 'Tipo inválido' })
  type: VehicleType;

  @ApiPropertyOptional({ example: 'Carro da família', nullable: true })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() || null : value))
  @IsOptional()
  @IsString()
  @MaxLength(40, { message: 'Apelido deve ter no máximo 40 caracteres' })
  nickname?: string | null;
}
