import { Module } from '@nestjs/common';
import { VehiclePhotoService } from './photos/vehicle-photo.service';
import { WikipediaClient } from './photos/wikipedia.client';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService, VehiclePhotoService, WikipediaClient],
})
export class VehiclesModule {}
