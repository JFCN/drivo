import { ApiProperty } from '@nestjs/swagger';
import { VehicleResponseDto } from './vehicle-response.dto';

export class VehicleListResponseDto {
  @ApiProperty({ type: VehicleResponseDto, isArray: true })
  data: VehicleResponseDto[];

  @ApiProperty({ example: 12, description: 'Total de veículos que atendem à busca' })
  total: number;
}
