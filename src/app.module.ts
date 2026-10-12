import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module.js';
import { config, ENV_FILE } from './config.js';
import { HealthModule } from './health/health.module.js';
import { HorsebackModule } from './horseback/horseback.module.js';
import { PriceRuleModule } from './price-rules/priceRule.module.js';
import { PricingModule } from './pricing/pricing.module.js';
import { ProductModule } from './products/product.module.js';
import { RoomModule } from './rooms/room.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { SharedModule } from './shared/shared.module.js';
import { UploadsModule } from './uploads/uploads.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
      // .env.development / .env.production según NODE_ENV (como en samawe).
      envFilePath: ENV_FILE,
    }),
    // Límite por defecto; el login lo restringe a 5/min con @Throttle.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    SharedModule.forRoot(),
    UploadsModule,
    HealthModule,
    AuthModule,
    SettingsModule,
    RoomModule,
    PriceRuleModule,
    PricingModule,
    HorsebackModule,
    ProductModule,
  ],
})
export class AppModule {}
