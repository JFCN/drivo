import { ApiProperty } from '@nestjs/swagger';
import { Fuel, VehicleType } from '@prisma/client';

export class CrlvExtractionDto {
  @ApiProperty({ type: String, nullable: true, example: 'RTX4B21' })
  plate: string | null;

  @ApiProperty({ type: String, nullable: true, example: '01234567890' })
  renavam: string | null;

  @ApiProperty({ type: String, nullable: true, example: '9BRBC3E31P4821000' })
  chassis: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'Toyota' })
  brand: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'Corolla Altis Hybrid' })
  model: string | null;

  @ApiProperty({ type: Number, nullable: true, example: 2022 })
  manufactureYear: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 2023 })
  modelYear: number | null;

  @ApiProperty({ type: String, nullable: true, example: 'Prata' })
  color: string | null;

  @ApiProperty({ enum: Fuel, nullable: true })
  fuel: Fuel | null;

  @ApiProperty({ enum: VehicleType, nullable: true })
  type: VehicleType | null;
}
