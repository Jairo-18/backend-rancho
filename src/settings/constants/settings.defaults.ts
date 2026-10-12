export const ROOM_LABELS = ['Cabañas', 'Habitaciones'] as const;
export type RoomLabel = (typeof ROOM_LABELS)[number];

export interface SocialLinks {
  instagram: string;
  facebook: string;
  tiktok: string;
}

/** Todos los ajustes del sitio. Se guardan como filas key/value (jsonb) en `settings`. */
export interface HotelSettings {
  hotelName: string;
  /** Cómo se nombran las habitaciones en la interfaz. */
  roomLabel: RoomLabel;
  /** Formato internacional, solo dígitos (ej. 573001234567). */
  whatsappNumber: string;
  /** Saludo cuando el visitante abre WhatsApp sin haber armado una solicitud. */
  whatsappGreeting: string;
  /** Si es true, la noche del viernes se cobra como fin de semana (CONTEXT §3.2). */
  fridayNightIsWeekend: boolean;
  address: string;
  city: string;
  /** Enlace de Google Maps para "Cómo llegar". */
  mapsUrl: string;
  email: string;
  phone: string;
  socials: SocialLinks;
}

export const DEFAULT_SETTINGS: HotelSettings = {
  hotelName: 'Rancho Porvenir',
  roomLabel: 'Cabañas',
  whatsappNumber: '',
  whatsappGreeting: '¡Hola! Quiero información sobre el Rancho Porvenir.',
  fridayNightIsWeekend: false,
  address: '',
  city: '',
  mapsUrl: '',
  email: '',
  phone: '',
  socials: { instagram: '', facebook: '', tiktok: '' },
};

export const SETTING_KEYS = Object.keys(
  DEFAULT_SETTINGS,
) as (keyof HotelSettings)[];
