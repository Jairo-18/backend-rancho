import { timingSafeEqual } from 'node:crypto';
import { resolve } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter.js';
import { ResponseEnvelopeInterceptor } from './shared/interceptors/response-envelope.interceptor.js';
import type { AppConfig } from './config.js';

export const API_PREFIX = 'api/v1';
export const DOCS_PATH = 'api/docs';

/** Configuración común de la app (usada por main.ts y por los tests e2e). */
export function setupApp(app: NestExpressApplication): void {
  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);

  if (config.get('app.trustProxy', { infer: true })) {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      // Las fotos de /uploads se muestran desde el dominio del frontend.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.enableCors({
    origin: config.get('app.cors.origin', { infer: true }),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());

  app.useStaticAssets(resolve(config.get('uploads.dir', { infer: true })), {
    prefix: '/uploads/',
    maxAge: '30d',
    immutable: true, // los nombres son UUID: un archivo nunca cambia
    index: false,
  });

  if (config.get('swagger.enabled', { infer: true })) {
    setupSwagger(app, config);
  }

  app.enableShutdownHooks();
}

function setupSwagger(
  app: NestExpressApplication,
  config: ConfigService<AppConfig, true>,
): void {
  const user = config.get('swagger.user', { infer: true });
  const password = config.get('swagger.password', { infer: true });
  if (user && password) {
    app.use(
      [`/${DOCS_PATH}`, `/${DOCS_PATH}-json`, `/${DOCS_PATH}-yaml`],
      basicAuth(user, password),
    );
  }

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Rancho Porvenir API')
      .setDescription(
        'API del Hotel Rancho Ecológico. Respuestas exitosas: `{ data }`. Errores: `{ statusCode, error, message, details? }`.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup(DOCS_PATH, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}

function basicAuth(user: string, password: string) {
  const expected = Buffer.from(
    `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`,
  );
  return (req: Request, res: Response, next: NextFunction): void => {
    const received = Buffer.from(req.headers.authorization ?? '');
    if (
      received.length === expected.length &&
      timingSafeEqual(received, expected)
    ) {
      next();
      return;
    }
    res.setHeader('WWW-Authenticate', 'Basic realm="Rancho Porvenir API docs"');
    res.status(401).send('Autenticación requerida');
  };
}
