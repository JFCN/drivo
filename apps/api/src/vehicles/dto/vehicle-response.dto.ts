import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Fuel, VehicleType } from '@prisma/client';
import type { VehicleWithPhoto } from '../vehicles.service';

export class VehicleResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'RTX4B21' })
  plate: string;

  @ApiProperty({ example: '01234567890' })
  renavam: string;

  @ApiProperty({ example: '9BRBC3E31P4821000' })
  chassis: string;

  @ApiProperty({ example: 'Toyota' })
  brand: string;

  @ApiProperty({ example: 'Corolla Altis Hybrid' })
  model: string;

  @ApiProperty({ example: 2022 })
  manufactureYear: number;

  @ApiProperty({ example: 2023 })
  modelYear: number;

  @ApiProperty({ example: 'Prata' })
  color: string;

  @ApiProperty({ enum: Fuel })
  fuel: Fuel;

  @ApiProperty({ enum: VehicleType })
  type: VehicleType;

  @ApiPropertyOptional({ nullable: true, type: String })
  nickname: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    example: '/api/vehicles/0b1c.../photo?v=1760000000000',
    description: 'Foto do modelo encontrada automaticamente. Null quando o modelo não foi encontrado',
  })
  photoUrl: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(vehicle: VehicleWithPhoto): VehicleResponseDto {
    const dto = new VehicleResponseDto();
    dto.id = vehicle.id;
    dto.plate = vehicle.plate;
    dto.renavam = vehicle.renavam;
    dto.chassis = vehicle.chassis;
    dto.brand = vehicle.brand;
    dto.model = vehicle.model;
    dto.manufactureYear = vehicle.manufactureYear;
    dto.modelYear = vehicle.modelYear;
    dto.color = vehicle.color;
    dto.fuel = vehicle.fuel;
    dto.type = vehicle.type;
    dto.nickname = vehicle.nickname;
    dto.photoUrl = vehicle.photo ? `/api/vehicles/${vehicle.id}/photo?v=${vehicle.photo.updatedAt.getTime()}` : null;
    dto.createdAt = vehicle.createdAt;
    dto.updatedAt = vehicle.updatedAt;
    return dto;
  }
}
