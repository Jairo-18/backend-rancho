import bcrypt from 'bcryptjs';
import sharp from 'sharp';
import type { EntityManager } from 'typeorm';
import { PASSWORD_HASH_ROUNDS } from '../auth/constants/auth.constants.js';
import { User, UserRole } from '../shared/entities/user.entity.js';
import { HorsebackImage } from '../shared/entities/horsebackImage.entity.js';
import { Horseback } from '../shared/entities/horseback.entity.js';
import {
  PriceRule,
  PriceRuleType,
} from '../shared/entities/priceRule.entity.js';
import { Product } from '../shared/entities/product.entity.js';
import { RoomImage } from '../shared/entities/roomImage.entity.js';
import { Room } from '../shared/entities/room.entity.js';
import { Setting } from '../shared/entities/setting.entity.js';
import { DEFAULT_SETTINGS } from '../settings/constants/settings.defaults.js';
import { LocalStorageService } from '../uploads/services/localStorage.service.js';
import type { StoredFile } from '../uploads/services/storage.service.js';
import dataSource, { appConfig } from '../../typeorm.config.js';
import { colombianHolidays, nightBefore } from './colombia-holidays.js';
import { placeholderSvg } from './placeholder-image.js';

/**
 * Datos de ejemplo idempotentes: se puede correr varias veces, solo crea lo que falta
 * (por correo, slug o nombre+fecha). Nunca modifica ni borra registros existentes.
 */

const storage = new LocalStorageService({
  rootDir: appConfig.uploads.dir,
  baseUrl: appConfig.app.baseUrl,
});
const createdFiles: StoredFile[] = [];
const log = (message: string): void => console.log(`  ${message}`);

async function samplePhotos(
  title: string,
  count: number,
  folder: string,
): Promise<StoredFile[]> {
  const files: StoredFile[] = [];
  for (let variant = 0; variant < count; variant++) {
    const buffer = await sharp(placeholderSvg(title, variant))
      .webp({ quality: 80 })
      .toBuffer();
    const file = await storage.save({
      buffer,
      folder,
      extension: 'webp',
      contentType: 'image/webp',
    });
    createdFiles.push(file);
    files.push(file);
  }
  return files;
}

async function seedAdmin(manager: EntityManager): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) {
    throw new Error(
      'Define SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD (mín. 8 caracteres) en .env',
    );
  }
  const users = manager.getRepository(User);
  if (await users.existsBy({ email })) {
    log(`admin ${email} ya existe`);
    return;
  }
  await users.insert({
    email,
    role: UserRole.Admin,
    passwordHash: await bcrypt.hash(password, PASSWORD_HASH_ROUNDS),
  });
  log(`admin ${email} creado`);
}

async function seedSettings(manager: EntityManager): Promise<void> {
  const values: Partial<typeof DEFAULT_SETTINGS> = {
    ...DEFAULT_SETTINGS,
    whatsappNumber: '573001234567', // reemplazar por el número real desde Ajustes
    address: 'Vereda El Porvenir, km 4 vía a la montaña',
    city: 'Colombia',
  };
  await manager
    .createQueryBuilder()
    .insert()
    .into(Setting)
    .values(Object.entries(values).map(([key, value]) => ({ key, value })))
    .orIgnore()
    .execute();
  log('ajustes por defecto listos (no se sobrescriben los existentes)');
}

const ROOMS = [
  {
    name: 'Cabaña del Roble',
    slug: 'cabana-del-roble',
    description:
      'Cabaña en madera de roble con jacuzzi privado al aire libre, chimenea y una terraza que mira a las montañas. Ideal para parejas que quieren desconectarse con el sonido del bosque.',
    hasJacuzzi: true,
    capacity: 2,
    weekdayPrice: 280_000,
    weekendPrice: 350_000,
  },
  {
    name: 'Cabaña Los Guaduales',
    slug: 'cabana-los-guaduales',
    description:
      'Rodeada de guaduales y a pocos pasos de la quebrada. Dos habitaciones, cocina equipada y hamacas en el corredor: perfecta para familias que quieren vivir la finca.',
    hasJacuzzi: false,
    capacity: 4,
    weekdayPrice: 320_000,
    weekendPrice: 420_000,
  },
  {
    name: 'Refugio del Arriero',
    slug: 'refugio-del-arriero',
    description:
      'Nuestra cabaña más amplia, con jacuzzi, fogón de leña y vista abierta al potrero de los caballos. Pensada para grupos y familias grandes que buscan tranquilidad.',
    hasJacuzzi: true,
    capacity: 6,
    weekdayPrice: 450_000,
    weekendPrice: 580_000,
  },
];

async function seedRooms(manager: EntityManager): Promise<void> {
  for (const data of ROOMS) {
    if (await manager.existsBy(Room, { slug: data.slug })) {
      log(`habitación ${data.slug} ya existe`);
      continue;
    }
    const room = await manager.save(
      manager.create(Room, { ...data, isActive: true }),
    );
    const photos = await samplePhotos(data.name, 4, 'rooms');
    await manager.insert(
      RoomImage,
      photos.map((photo, position) => ({
        roomId: room.id,
        url: photo.url,
        storageKey: photo.key,
        position,
        isCover: position === 0,
      })),
    );
    log(`habitación ${data.slug} creada con ${photos.length} fotos`);
  }
}

const HORSEBACK_RIDES = [
  {
    name: 'Cabalgata al atardecer',
    slug: 'cabalgata-al-atardecer',
    description:
      'Recorrido tranquilo por los potreros y el filo de la montaña para ver caer el sol. Apta para principiantes; vamos siempre con un guía del rancho.',
    durationMinutes: 90,
    pricePerPerson: null, // precio aún sin definir → "Consultar precio"
    schedule: 'Todos los días a las 4:30 p. m. Sujeta al clima.',
  },
  {
    name: 'Ruta de la quebrada',
    slug: 'ruta-de-la-quebrada',
    description:
      'Cabalgata entre bosque y guaduales hasta la quebrada, con parada para refrescarse y tomar un tinto campesino.',
    durationMinutes: 120,
    pricePerPerson: 70_000, // valor de ejemplo
    schedule: 'Sábados, domingos y festivos a las 9:00 a. m.',
  },
];

async function seedHorseback(manager: EntityManager): Promise<void> {
  for (const data of HORSEBACK_RIDES) {
    if (await manager.existsBy(Horseback, { slug: data.slug })) {
      log(`cabalgata ${data.slug} ya existe`);
      continue;
    }
    const ride = await manager.save(
      manager.create(Horseback, { ...data, isActive: true }),
    );
    const photos = await samplePhotos(data.name, 2, 'horseback');
    await manager.insert(
      HorsebackImage,
      photos.map((photo, position) => ({
        horsebackId: ride.id,
        url: photo.url,
        storageKey: photo.key,
        position,
      })),
    );
    log(`cabalgata ${data.slug} creada`);
  }
}

const PRODUCTS = [
  {
    name: 'Miel de abejas',
    slug: 'miel-de-abejas',
    description: 'Miel pura de nuestras colmenas, frasco de 500 g.',
    price: 28_000,
  },
  {
    name: 'Café de origen',
    slug: 'cafe-de-origen',
    description: 'Café tostado y molido de fincas vecinas, bolsa de 500 g.',
    price: 32_000,
  },
  {
    name: 'Mochila tejida a mano',
    slug: 'mochila-tejida-a-mano',
    description: 'Mochila artesanal tejida por mujeres de la vereda.',
    price: 95_000,
  },
  {
    name: 'Queso campesino',
    slug: 'queso-campesino',
    description: 'Queso fresco hecho en el rancho con leche del día, 500 g.',
    price: 18_000,
  },
];

async function seedProducts(manager: EntityManager): Promise<void> {
  for (const data of PRODUCTS) {
    if (await manager.existsBy(Product, { slug: data.slug })) {
      log(`producto ${data.slug} ya existe`);
      continue;
    }
    const [photo] = await samplePhotos(data.name, 1, 'products');
    await manager.insert(Product, {
      ...data,
      imageUrl: photo.url,
      imageStorageKey: photo.key,
      isActive: true,
    });
    log(`producto ${data.slug} creado`);
  }
}

/** Año en curso según la hora de Colombia. */
function currentYearInBogota(): number {
  return Number(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: appConfig.app.timezone,
      year: 'numeric',
    }).format(new Date()),
  );
}

async function seedPriceRules(manager: EntityManager): Promise<void> {
  const year = currentYearInBogota();
  const rules: Partial<PriceRule>[] = [];

  // Festivos del año en curso y del siguiente: recargo de ejemplo sobre la noche ANTERIOR al
  // festivo, que es la que el huésped duerme en un puente. Valores a confirmar con el cliente.
  for (const holiday of [
    ...colombianHolidays(year),
    ...colombianHolidays(year + 1),
  ]) {
    const night = nightBefore(holiday.date);
    rules.push({
      name: `Festivo: ${holiday.name} ${holiday.date.slice(0, 4)}`,
      startDate: night,
      endDate: night,
      roomId: null,
      type: PriceRuleType.Percent,
      value: 15,
      priority: 10,
      isActive: true,
    });
  }

  rules.push({
    name: `Temporada de fin de año ${year}-${year + 1}`,
    startDate: `${year}-12-20`,
    endDate: `${year + 1}-01-11`,
    roomId: null,
    type: PriceRuleType.Percent,
    value: 25,
    priority: 20,
    isActive: true,
  });

  let created = 0;
  for (const rule of rules) {
    if (
      await manager.existsBy(PriceRule, {
        name: rule.name,
        startDate: rule.startDate,
      })
    )
      continue;
    await manager.insert(PriceRule, rule);
    created++;
  }
  log(`reglas de precio: ${created} nuevas de ${rules.length}`);
}

async function main(): Promise<void> {
  console.log(
    `Seed en ${appConfig.db.host}:${appConfig.db.port}/${appConfig.db.database}`,
  );
  await dataSource.initialize();
  try {
    await dataSource.transaction(async (manager) => {
      await seedAdmin(manager);
      await seedSettings(manager);
      await seedRooms(manager);
      await seedHorseback(manager);
      await seedProducts(manager);
      await seedPriceRules(manager);
    });
    console.log('Seed completado ✔');
  } catch (error) {
    // La transacción se revirtió: se borran las fotos generadas para no dejar huérfanas.
    await Promise.all(createdFiles.map((file) => storage.delete(file.key)));
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

await main();
