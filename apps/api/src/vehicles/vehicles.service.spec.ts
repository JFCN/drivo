import { ConflictException, NotFoundException } from '@nestjs/common';
import { Fuel, VehicleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { VehiclePhotoService } from './photos/vehicle-photo.service';
import { VehiclesService, VehicleWithPhoto } from './vehicles.service';

const vehicle: VehicleWithPhoto = {
  id: 'vehicle-1',
  userId: 'user-1',
  plate: 'RTX4B21',
  renavam: '01234567890',
  chassis: '9BRBC3E31P4821000',
  brand: 'Toyota',
  model: 'Corolla Altis Hybrid',
  manufactureYear: 2022,
  modelYear: 2023,
  color: 'Prata',
  fuel: Fuel.HYBRID,
  type: VehicleType.CAR,
  nickname: null,
  createdAt: new Date('2026-03-01'),
  updatedAt: new Date('2026-03-01'),
  photo: null,
};

const createDto: CreateVehicleDto = {
  plate: vehicle.plate,
  renavam: vehicle.renavam,
  chassis: vehicle.chassis,
  brand: vehicle.brand,
  model: vehicle.model,
  manufactureYear: vehicle.manufactureYear,
  modelYear: vehicle.modelYear,
  color: vehicle.color,
  fuel: vehicle.fuel,
  type: vehicle.type,
};

describe('VehiclesService', () => {
  let prisma: {
    vehicle: { findFirst: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
  };
  let photos: { refresh: jest.Mock };
  let service: VehiclesService;

  beforeEach(() => {
    photos = { refresh: jest.fn().mockResolvedValue(undefined) };
    prisma = {
      vehicle: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    };
    service = new VehiclesService(prisma as unknown as PrismaService, photos as unknown as VehiclePhotoService);
  });

  it('cadastra o veículo vinculado ao usuário e busca a foto do modelo', async () => {
    prisma.vehicle.findUnique.mockResolvedValue(null);
    prisma.vehicle.create.mockResolvedValue(vehicle);
    prisma.vehicle.findFirst.mockResolvedValue(vehicle);

    await service.create('user-1', createDto);

    expect(prisma.vehicle.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 'user-1', plate: 'RTX4B21' }),
    });
    expect(photos.refresh).toHaveBeenCalledWith(vehicle);
  });

  it('impede cadastrar a mesma placa duas vezes', async () => {
    prisma.vehicle.findUnique.mockResolvedValue(vehicle);

    await expect(service.create('user-1', createDto)).rejects.toThrow(ConflictException);
  });

  it('edita um veículo do usuário', async () => {
    prisma.vehicle.findFirst.mockResolvedValueOnce(vehicle).mockResolvedValueOnce({ ...vehicle, color: 'Preto' });
    prisma.vehicle.update.mockResolvedValue({ ...vehicle, color: 'Preto' });

    const result = await service.update('user-1', vehicle.id, { color: 'Preto' });

    expect(result.color).toBe('Preto');
  });

  it('não edita veículo de outro usuário', async () => {
    prisma.vehicle.findFirst.mockResolvedValue(null);

    await expect(service.update('user-2', vehicle.id, { color: 'Preto' })).rejects.toThrow(NotFoundException);
    expect(prisma.vehicle.update).not.toHaveBeenCalled();
  });

  it('exclui um veículo do usuário', async () => {
    prisma.vehicle.findFirst.mockResolvedValue(vehicle);

    await service.remove('user-1', vehicle.id);

    expect(prisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: vehicle.id } });
  });
});
