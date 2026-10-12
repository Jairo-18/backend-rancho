import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import type { DbConfig } from '../../config.js';
import { Horseback } from '../entities/horseback.entity.js';
import { HorsebackImage } from '../entities/horsebackImage.entity.js';
import { PriceRule } from '../entities/priceRule.entity.js';
import { Product } from '../entities/product.entity.js';
import { Room } from '../entities/room.entity.js';
import { RoomImage } from '../entities/roomImage.entity.js';
import { Setting } from '../entities/setting.entity.js';
import { User } from '../entities/user.entity.js';
import { SnakeNamingStrategy } from './snake-naming.strategy.js';

export const ENTITIES = [
  User,
  Room,
  RoomImage,
  PriceRule,
  Horseback,
  HorsebackImage,
  Product,
  Setting,
];

/** Opciones compartidas por la app (SharedModule) y el CLI de migraciones / seed (typeorm.config.ts). */
export function buildDataSourceOptions(db: DbConfig): DataSourceOptions {
  return {
    type: 'postgres',
    host: db.host,
    port: db.port,
    username: db.username,
    password: db.password,
    database: db.database,
    ssl: db.ssl ? { rejectUnauthorized: false } : false,
    entities: ENTITIES,
    namingStrategy: new SnakeNamingStrategy(),
    // Las migraciones se ejecutan compiladas (dist/src/migrations/*.js).
    migrations: [join(import.meta.dirname, '..', '..', 'migrations', '*.js')],
    migrationsTableName: 'migrations',
    synchronize: false,
    // gen_random_uuid() es nativa desde PG 13: no se instalan extensiones (uuid-ossp).
    uuidExtension: 'pgcrypto',
    installExtensions: false,
  };
}
