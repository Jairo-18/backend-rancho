import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
  StorageService,
  type StoreFileInput,
  type StoredFile,
} from './storage.service.js';

export interface LocalStorageOptions {
  /** Carpeta en disco (UPLOADS_DIR). */
  rootDir: string;
  /** URL pública del backend (APP_BASE_URL). */
  baseUrl: string;
}

const KEY_PATTERN = /^[a-z0-9-]+\/[a-f0-9-]+\.[a-z0-9]+$/;

/** Guarda archivos en disco; main.ts los sirve en `/uploads`. */
export class LocalStorageService extends StorageService {
  private readonly rootDir: string;
  private readonly baseUrl: string;

  constructor(options: LocalStorageOptions) {
    super();
    this.rootDir = resolve(options.rootDir);
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
  }

  async save({
    buffer,
    folder,
    extension,
  }: StoreFileInput): Promise<StoredFile> {
    const key = `${folder}/${randomUUID()}.${extension}`;
    await mkdir(join(this.rootDir, folder), { recursive: true });
    await writeFile(join(this.rootDir, key), buffer);
    return { key, url: `/uploads/${key}` };
  }

  publicUrl(storedUrl: string): string {
    return storedUrl.startsWith('/')
      ? `${this.baseUrl}${storedUrl}`
      : storedUrl;
  }

  async delete(key: string): Promise<void> {
    // La clave siempre la generamos nosotros; se valida para no borrar fuera de UPLOADS_DIR.
    if (!KEY_PATTERN.test(key)) {
      throw new Error(`Clave de archivo inválida: ${key}`);
    }
    await rm(join(this.rootDir, key), { force: true });
  }
}
