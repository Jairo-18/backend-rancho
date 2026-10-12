import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config, ENV_FILE } from './src/config.js';
import { buildDataSourceOptions } from './src/shared/utils/typeorm.options.js';

// DataSource del CLI de TypeORM (migraciones) y del seed, fuera de Nest (como en samawe).
// Carga .env.development o .env.production según NODE_ENV; las variables ya
// presentes en el entorno tienen prioridad.
try {
  process.loadEnvFile(ENV_FILE);
} catch {
  // Sin archivo: se usan solo las variables del entorno (contenedor).
}

export const appConfig = config();

// El CLI de TypeORM exige que el archivo exporte UN solo DataSource.
export default new DataSource(buildDataSourceOptions(appConfig.db));
