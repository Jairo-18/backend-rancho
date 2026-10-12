export interface StoreFileInput {
  buffer: Buffer;
  /** Carpeta lógica: `rooms`, `horseback`, `products`. */
  folder: string;
  extension: string;
  contentType: string;
}

export interface StoredFile {
  /** Identificador para borrar el archivo después. */
  key: string;
  /**
   * Lo que se guarda en la base. Local: ruta relativa (`/uploads/...`), para no atar
   * los datos a un dominio. S3 / Cloudinary: URL absoluta.
   */
  url: string;
}

/**
 * Contrato de almacenamiento. Hoy: disco local (LocalStorageService).
 * Para S3 / Cloudinary basta otra implementación registrada en UploadsModule.
 */
export abstract class StorageService {
  abstract save(input: StoreFileInput): Promise<StoredFile>;
  abstract delete(key: string): Promise<void>;
  /** Convierte la URL guardada en la base en una URL pública absoluta. */
  abstract publicUrl(storedUrl: string): string;
}
