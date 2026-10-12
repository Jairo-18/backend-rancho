import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

const DURATION_PATTERN = /^\d+[smhd]?$/;

const toBoolean = ({ value }: { value: unknown }): boolean =>
  value === true || value === 'true' || value === '1';

/** Variables de entorno: se validan al arrancar y la app no inicia si falta alguna. */
export class EnvironmentVariables {
  // APP
  @IsInt()
  @Min(1)
  @Max(65535)
  APP_PORT: number = 4000;

  @IsIn(['development', 'production', 'test'])
  APP_ENV: 'development' | 'production' | 'test' = 'development';

  @IsString()
  APP_NAME = 'rancho-api';

  @IsString()
  @IsNotEmpty()
  APP_TIMEZONE = 'America/Bogota';

  @IsString()
  @IsNotEmpty()
  APP_BASE_URL = 'http://localhost:4000';

  @IsString()
  APP_FRONTEND_URL = 'http://localhost:3000';

  @Transform(toBoolean)
  @IsBoolean()
  APP_TRUST_PROXY = false;

  // CORS
  @IsString()
  APP_CORS_ORIGIN = 'http://localhost:3000';

  // DATABASE
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsInt()
  DB_PORT: number = 5432;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_DATABASE: string;

  @Transform(toBoolean)
  @IsBoolean()
  DB_SSL = false;

  // JWT
  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET: string;

  @Matches(DURATION_PATTERN)
  JWT_ACCESS_EXPIRES_IN = '15m';

  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET: string;

  @Matches(DURATION_PATTERN)
  JWT_REFRESH_EXPIRES_IN = '7d';

  // SWAGGER
  @Transform(toBoolean)
  @IsBoolean()
  SWAGGER_ENABLED = true;

  @IsString()
  SWAGGER_USER = '';

  @IsString()
  SWAGGER_PASSWORD = '';

  // UPLOADS
  @IsIn(['local'])
  UPLOADS_DRIVER = 'local' as const;

  @IsString()
  @IsNotEmpty()
  UPLOADS_DIR = './uploads';

  @IsInt()
  @Min(1)
  @Max(25)
  UPLOADS_MAX_MB: number = 15;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    excludeExtraneousValues: false,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const lines = errors.map(
      (error) =>
        `  - ${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`,
    );
    throw new Error(`Variables de entorno inválidas:\n${lines.join('\n')}`);
  }
  return validated;
}

/** Archivo de variables según NODE_ENV (como en samawe). Las del entorno del contenedor tienen prioridad. */
export const ENV_FILE =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

/**
 * Configuración agrupada por sección (como el `config.ts` de samawe). Se carga en
 * ConfigModule con `load: [config]` y se lee con claves como `'jwt.accessSecret'`.
 */
export const config = () => {
  const env = validateEnv(process.env);
  return {
    app: {
      name: env.APP_NAME,
      env: env.APP_ENV,
      port: env.APP_PORT,
      timezone: env.APP_TIMEZONE,
      baseUrl: env.APP_BASE_URL,
      frontendUrl: env.APP_FRONTEND_URL,
      trustProxy: env.APP_TRUST_PROXY,
      cors: {
        origin: env.APP_CORS_ORIGIN.split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      },
    },
    db: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_DATABASE,
      ssl: env.DB_SSL,
    },
    jwt: {
      accessSecret: env.JWT_ACCESS_SECRET,
      accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
      refreshSecret: env.JWT_REFRESH_SECRET,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },
    swagger: {
      enabled: env.SWAGGER_ENABLED,
      user: env.SWAGGER_USER,
      password: env.SWAGGER_PASSWORD,
    },
    uploads: {
      driver: env.UPLOADS_DRIVER,
      dir: env.UPLOADS_DIR,
      maxMb: env.UPLOADS_MAX_MB,
    },
  };
};

export type AppConfig = ReturnType<typeof config>;
export type DbConfig = AppConfig['db'];
