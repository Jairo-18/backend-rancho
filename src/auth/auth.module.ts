import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';
import { AuthUC } from './useCases/authUC.uc.js';

@Module({
  controllers: [AuthController],
  providers: [AuthUC, AuthService],
})
export class AuthModule {}
