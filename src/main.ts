import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { API_PREFIX, DOCS_PATH, setupApp } from './app.setup.js';
import type { AppConfig } from './config.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupApp(app);

  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);
  const port = config.get('app.port', { infer: true });
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`API lista en http://localhost:${port}/${API_PREFIX}`);
  if (config.get('swagger.enabled', { infer: true })) {
    logger.log(`Swagger en http://localhost:${port}/${DOCS_PATH}`);
  }
}
await bootstrap();
