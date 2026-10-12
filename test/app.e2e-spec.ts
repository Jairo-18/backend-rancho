import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import sharp from 'sharp';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import type { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { API_PREFIX, setupApp } from '../src/app.setup.js';
import { RoomImage } from '../src/shared/entities/roomImage.entity.js';
import { Room } from '../src/shared/entities/room.entity.js';
import { StorageService } from '../src/uploads/services/storage.service.js';

/**
 * Flujo completo contra la base de .env.development (requiere migraciones + seed).
 * Lo que crea lo borra al final.
 */

const api = (path: string): string => `/${API_PREFIX}${path}`;

interface RoomBody {
  id: string;
  isActive: boolean;
  coverImageUrl: string | null;
  images: { id: string; isCover: boolean; position: number }[];
}

const samplePng = (): Promise<Buffer> =>
  sharp({
    create: { width: 40, height: 30, channels: 3, background: '#6B8E4E' },
  })
    .png()
    .toBuffer();

describe('API (e2e)', () => {
  let app: NestExpressApplication;
  let server: App;
  let token: string;
  let roomId: string | undefined;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
    server = app.getHttpServer() as App;

    const login = await request(server)
      .post(api('/auth/login'))
      .send({
        email: process.env.SEED_ADMIN_EMAIL,
        password: process.env.SEED_ADMIN_PASSWORD,
      })
      .expect(200);
    token = (login.body as { data: { accessToken: string } }).data.accessToken;
  });

  afterAll(async () => {
    if (roomId) {
      const dataSource = app.get<DataSource>(getDataSourceToken());
      const images = await dataSource
        .getRepository(RoomImage)
        .findBy({ roomId });
      const storage = app.get(StorageService);
      await Promise.all(
        images.map((image) => storage.delete(image.storageKey)),
      );
      await dataSource.getRepository(Room).delete({ id: roomId });
    }
    await app.close();
  });

  it('GET /health responde ok', async () => {
    const res = await request(server).get(api('/health')).expect(200);
    expect(res.body).toEqual({ data: { status: 'ok', database: 'up' } });
  });

  it('GET /settings/public devuelve los ajustes', async () => {
    const res = await request(server).get(api('/settings/public')).expect(200);
    expect(res.body.data).toMatchObject({
      roomLabel: expect.any(String),
      fridayNightIsWeekend: false,
    });
  });

  it('GET /rooms lista solo habitaciones activas con fotos ordenadas', async () => {
    const res = await request(server).get(api('/rooms')).expect(200);
    const rooms = res.body.data as RoomBody[];
    expect(rooms.length).toBeGreaterThanOrEqual(3);
    expect(rooms.every((room) => room.isActive)).toBe(true);
  });

  it('login con clave incorrecta → 401 con formato de error', async () => {
    const res = await request(server)
      .post(api('/auth/login'))
      .send({ email: 'nadie@ejemplo.co', password: 'clave-incorrecta' })
      .expect(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      message: 'Correo o contraseña incorrectos',
    });
  });

  it('rutas admin exigen token', async () => {
    await request(server).get(api('/rooms/admin')).expect(401);
  });

  it('validación de DTO → 400 con details', async () => {
    const res = await request(server)
      .post(api('/rooms'))
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', weekdayPrice: -1, extra: true })
      .expect(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.any(String)]),
    );
  });

  it('ciclo de vida de una habitación con la regla de 3 a 5 fotos', async () => {
    const auth = { Authorization: `Bearer ${token}` };

    // Crear: queda inactiva
    const created = await request(server)
      .post(api('/rooms'))
      .set(auth)
      .send({
        name: 'Cabaña de Prueba E2E',
        description: 'Creada por el test e2e',
        weekdayPrice: 100000,
        weekendPrice: 150000,
      })
      .expect(201);
    const room = created.body.data as RoomBody;
    roomId = room.id;
    expect(room.isActive).toBe(false);

    // No se puede activar sin 3 fotos
    await request(server)
      .patch(api(`/rooms/${room.id}`))
      .set(auth)
      .send({ isActive: true })
      .expect(400);

    // Subir 3 fotos, una por petición (campo "file")
    const png = await samplePng();
    const uploadOne = (name: string) =>
      request(server)
        .post(api(`/rooms/${room.id}/images`))
        .set(auth)
        .attach('file', png, name);
    let current = room;
    for (let i = 0; i < 3; i++) {
      current = (await uploadOne(`foto${i}.png`).expect(201)).body
        .data as RoomBody;
    }
    expect(current.images).toHaveLength(3);
    expect(current.images.filter((image) => image.isCover)).toHaveLength(1);
    expect(current.images[0].isCover).toBe(true);

    // Un archivo que no es imagen se rechaza aunque declare image/png
    await request(server)
      .post(api(`/rooms/${room.id}/images`))
      .set(auth)
      .attach('file', Buffer.from('no soy imagen'), {
        filename: 'x.png',
        contentType: 'image/png',
      })
      .expect(415);

    // Dos archivos en una petición se rechazan
    await request(server)
      .post(api(`/rooms/${room.id}/images`))
      .set(auth)
      .attach('file', png, 'a.png')
      .attach('file', png, 'b.png')
      .expect(400);

    // Activar
    const activated = await request(server)
      .patch(api(`/rooms/${room.id}`))
      .set(auth)
      .send({ isActive: true })
      .expect(200);
    expect((activated.body.data as RoomBody).isActive).toBe(true);

    // Activa con 3 fotos: no se puede bajar de 3
    await request(server)
      .delete(api(`/rooms/${room.id}/images/${current.images[0].id}`))
      .set(auth)
      .expect(400);

    // Hasta 5 fotos; la sexta se rechaza
    for (let i = 3; i < 5; i++) {
      current = (await uploadOne(`foto${i}.png`).expect(201)).body
        .data as RoomBody;
    }
    expect(current.images).toHaveLength(5);
    await uploadOne('sexta.png').expect(400);

    // Reordenar y cambiar portada
    const reversed = [...current.images].reverse().map((image) => image.id);
    const reordered = await request(server)
      .patch(api(`/rooms/${room.id}/images/reorder`))
      .set(auth)
      .send({ imageIds: reversed, coverImageId: reversed[1] })
      .expect(200);
    const images = (reordered.body.data as RoomBody).images;
    expect(images.map((image) => image.id)).toEqual(reversed);
    expect(images.find((image) => image.isCover)?.id).toBe(reversed[1]);

    // Borrar la portada pasa la portada a la primera restante, y borra fila y archivo
    const dataSource = app.get<DataSource>(getDataSourceToken());
    const deleted = await dataSource
      .getRepository(RoomImage)
      .findOneByOrFail({ id: reversed[1] });
    const deletedFile = join(
      process.env.UPLOADS_DIR ?? './uploads',
      deleted.storageKey,
    );
    expect(existsSync(deletedFile)).toBe(true);
    const afterDelete = await request(server)
      .delete(api(`/rooms/${room.id}/images/${reversed[1]}`))
      .set(auth)
      .expect(200);
    const remaining = (afterDelete.body.data as RoomBody).images;
    expect(remaining).toHaveLength(4);
    expect(remaining[0].isCover).toBe(true);
    expect(
      await dataSource.getRepository(RoomImage).existsBy({ id: reversed[1] }),
    ).toBe(false);
    expect(existsSync(deletedFile)).toBe(false);

    // Borrado lógico
    await request(server)
      .delete(api(`/rooms/${room.id}`))
      .set(auth)
      .expect(204);
    const publicList = await request(server).get(api('/rooms')).expect(200);
    expect(
      (publicList.body.data as RoomBody[]).some((r) => r.id === room.id),
    ).toBe(false);
  });
});
