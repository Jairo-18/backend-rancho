import { Module } from '@nestjs/common';
import { HorsebackController } from './controllers/horseback.controller.js';
import { HorsebackPublicController } from './controllers/horseback-public.controller.js';
import { HorsebackService } from './services/horseback.service.js';
import { HorsebackImageService } from './services/horsebackImage.service.js';
import { HorsebackUC } from './useCases/horsebackUC.uc.js';

@Module({
  // El admin primero: su GET `horseback/admin` no debe caer en el `horseback/:slug` público.
  controllers: [HorsebackController, HorsebackPublicController],
  providers: [HorsebackUC, HorsebackService, HorsebackImageService],
})
export class HorsebackModule {}
