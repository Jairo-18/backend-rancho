import { type DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { AppConfig } from '../config.js';
import { buildDataSourceOptions, ENTITIES } from './utils/typeorm.options.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { HorsebackRepository } from './repositories/horseback.repository.js';
import { HorsebackImageRepository } from './repositories/horsebackImage.repository.js';
import { PriceRuleRepository } from './repositories/priceRule.repository.js';
import { ProductRepository } from './repositories/product.repository.js';
import { RoomRepository } from './repositories/room.repository.js';
import { RoomImageRepository } from './repositories/roomImage.repository.js';
import { SettingRepository } from './repositories/setting.repository.js';
import { UserRepository } from './repositories/user.repository.js';

const REPOSITORIES = [
  UserRepository,
  RoomRepository,
  RoomImageRepository,
  PriceRuleRepository,
  HorsebackRepository,
  HorsebackImageRepository,
  ProductRepository,
  SettingRepository,
];

/**
 * Módulo compartido (como en samawe): conexión a la base, entidades,
 * repositorios y el guard JWT. Global: cualquier módulo los inyecta sin
 * importarlo.
 */
@Module({})
export class SharedModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: SharedModule,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService<AppConfig, true>) =>
            buildDataSourceOptions(config.get('db', { infer: true })),
        }),
        TypeOrmModule.forFeature(ENTITIES),
        // Los secretos se pasan en cada sign/verify (access y refresh usan secretos distintos).
        JwtModule.register({}),
      ],
      providers: [...REPOSITORIES, JwtAuthGuard],
      exports: [...REPOSITORIES, JwtModule, JwtAuthGuard],
    };
  }
}
