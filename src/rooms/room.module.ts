import { Module } from '@nestjs/common';
import { RoomController } from './controllers/room.controller.js';
import { RoomPublicController } from './controllers/room-public.controller.js';
import { RoomService } from './services/room.service.js';
import { RoomImageService } from './services/roomImage.service.js';
import { RoomUC } from './useCases/roomUC.uc.js';

@Module({
  // El admin primero: su GET `rooms/admin` no debe caer en el `rooms/:slug` público.
  controllers: [RoomController, RoomPublicController],
  providers: [RoomUC, RoomService, RoomImageService],
})
export class RoomModule {}
