import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { ListVehiclesQueryDto } from './dto/list-vehicles-query.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleListResponseDto } from './dto/vehicle-list-response.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { VehiclePhotoService } from './photos/vehicle-photo.service';
import { VehiclesService } from './vehicles.service';

@ApiTags('vehicles')
@ApiCookieAuth('access_token')
@ApiUnauthorizedResponse({ description: 'Sessão ausente ou expirada' })
@Controller('vehicles')
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly photos: VehiclePhotoService,
  ) {}

  @Get()
  @ApiOkResponse({ type: VehicleListResponseDto })
  async findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: ListVehiclesQueryDto): Promise<VehicleListResponseDto> {
    const { items, total } = await this.vehiclesService.findAll(user.id, query);
    return { data: items.map(VehicleResponseDto.fromEntity), total };
  }

  @Get(':id')
  @ApiOkResponse({ type: VehicleResponseDto })
  @ApiNotFoundResponse({ description: 'Veículo não encontrado' })
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<VehicleResponseDto> {
    return VehicleResponseDto.fromEntity(await this.vehiclesService.findOne(user.id, id));
  }

  @Get(':id/photo')
  @Header('Cache-Control', 'private, max-age=604800, immutable')
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  @ApiOkResponse({ description: 'Imagem do modelo do veículo' })
  @ApiNotFoundResponse({ description: 'Veículo sem foto' })
  async photo(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<StreamableFile> {
    const photo = await this.photos.findForUser(user.id, id);
    return new StreamableFile(Buffer.from(photo.data), { type: photo.mimeType });
  }

  @Post()
  @ApiCreatedResponse({ type: VehicleResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({ description: 'Placa já cadastrada para este usuário' })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateVehicleDto): Promise<VehicleResponseDto> {
    return VehicleResponseDto.fromEntity(await this.vehiclesService.create(user.id, dto));
  }

  @Patch(':id')
  @ApiOkResponse({ type: VehicleResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Veículo não encontrado' })
  @ApiConflictResponse({ description: 'Placa já cadastrada para este usuário' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    return VehicleResponseDto.fromEntity(await this.vehiclesService.update(user.id, id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Veículo excluído' })
  @ApiNotFoundResponse({ description: 'Veículo não encontrado' })
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.vehiclesService.remove(user.id, id);
  }
}
