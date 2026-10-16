import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { normalizePlate } from '../common/validation/patterns';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { ListVehiclesQueryDto } from './dto/list-vehicles-query.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclePhotoService } from './photos/vehicle-photo.service';

const DUPLICATE_PLATE_MESSAGE = 'Você já cadastrou um veículo com esta placa';

const WITH_PHOTO = { photo: { select: { updatedAt: true } } } satisfies Prisma.VehicleInclude;

export type VehicleWithPhoto = Prisma.VehicleGetPayload<{ include: typeof WITH_PHOTO }>;

export const buildSearchFilter = (search?: string): Prisma.VehicleWhereInput | undefined => {
  if (!search) {
    return undefined;
  }

  const plate = normalizePlate(search);
  const conditions: Prisma.VehicleWhereInput[] = [
    { model: { contains: search, mode: 'insensitive' } },
    { brand: { contains: search, mode: 'insensitive' } },
    { nickname: { contains: search, mode: 'insensitive' } },
  ];

  if (plate) {
    conditions.push({ plate: { contains: plate } });
  }

  return { OR: conditions };
};

export const assertValidYears = (manufactureYear: number, modelYear: number): void => {
  if (modelYear < manufactureYear || modelYear > manufactureYear + 1) {
    throw new BadRequestException('O ano do modelo deve ser igual ou um ano após o ano de fabricação');
  }
};

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly photos: VehiclePhotoService,
  ) {}

  async findAll(userId: string, query: ListVehiclesQueryDto): Promise<{ items: VehicleWithPhoto[]; total: number }> {
    const filter = buildSearchFilter(query.search);
    const where: Prisma.VehicleWhereInput = filter ? { userId, ...filter } : { userId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        include: WITH_PHOTO,
        orderBy: { createdAt: 'desc' },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(userId: string, id: string): Promise<VehicleWithPhoto> {
    const vehicle = await this.prisma.vehicle.findFirst({ where: { id, userId }, include: WITH_PHOTO });
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }
    return vehicle;
  }

  async create(userId: string, dto: CreateVehicleDto): Promise<VehicleWithPhoto> {
    assertValidYears(dto.manufactureYear, dto.modelYear);
    await this.ensurePlateAvailable(userId, dto.plate);

    const vehicle = await this.prisma.vehicle.create({
      data: { ...dto, nickname: dto.nickname ?? null, userId },
    });
    await this.photos.refresh(vehicle);

    return this.findOne(userId, vehicle.id);
  }

  async update(userId: string, id: string, dto: UpdateVehicleDto): Promise<VehicleWithPhoto> {
    const current = await this.findOne(userId, id);
    assertValidYears(dto.manufactureYear ?? current.manufactureYear, dto.modelYear ?? current.modelYear);

    if (dto.plate && dto.plate !== current.plate) {
      await this.ensurePlateAvailable(userId, dto.plate);
    }

    const vehicle = await this.prisma.vehicle.update({ where: { id: current.id }, data: dto });

    const identityChanged = vehicle.brand !== current.brand || vehicle.model !== current.model;
    if (identityChanged || !current.photo) {
      await this.photos.refresh(vehicle);
    }

    return this.findOne(userId, vehicle.id);
  }

  async remove(userId: string, id: string): Promise<void> {
    const vehicle = await this.findOne(userId, id);
    await this.prisma.vehicle.delete({ where: { id: vehicle.id } });
  }

  private async ensurePlateAvailable(userId: string, plate: string): Promise<void> {
    const existing = await this.prisma.vehicle.findUnique({ where: { userId_plate: { userId, plate } } });
    if (existing) {
      throw new ConflictException(DUPLICATE_PLATE_MESSAGE);
    }
  }
}
