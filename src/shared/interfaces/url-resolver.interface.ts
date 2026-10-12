/** Convierte la URL guardada en la base en una URL pública (StorageService.publicUrl). */
export type UrlResolver = (storedUrl: string) => string;
