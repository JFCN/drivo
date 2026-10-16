import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { trimString } from '../../common/validation/patterns';

export class ListVehiclesQueryDto {
  @ApiPropertyOptional({ description: 'Busca por placa, marca, modelo ou apelido', example: 'corolla' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;

  @ApiPropertyOptional({ description: 'Quantidade de veículos a pular', default: 0, minimum: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  offset: number = 0;

  @ApiPropertyOptional({ description: 'Quantidade máxima de veículos retornados', default: 6, minimum: 1, maximum: 50 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 6;
}
