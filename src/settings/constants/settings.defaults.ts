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

  // --- Información para el huésped (página "Cómo llegar" y detalle de cabaña) ---
  /** Hora de llegada tal como se muestra, ej. "3:00 p. m.". */
  checkInTime: string;
  checkOutTime: string;
  /** Zonas comunes a las que tienen acceso los huéspedes. */
  sharedAreas: string;
  petsPolicy: string;
  /** Una recomendación por elemento. */
  recommendations: string[];
  /** Normas de la casa (prohibiciones, daños). */
  houseRules: string[];
  /** Condiciones de reserva, una por elemento: "Título: texto". */
  bookingTerms: string[];
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

  // Valores del portafolio del cliente ("Rancho Porvenir · 2026").
  checkInTime: '3:00 p. m.',
  checkOutTime: '12:00 m.',
  sharedAreas: 'Cocina, kiosko, parrilla y barril asador',
  petsPolicy:
    'Las mascotas son bienvenidas en el rancho, pero no pueden entrar a las cabañas. Su dueño responde por su cuidado y por cualquier daño.',
  recommendations: [
    'Si vas a cabalgar, trae ropa cómoda.',
    'Trae repelente para insectos.',
    'Puedes traer alimentos y bebidas para tu consumo; te prestamos ollas, platos y vasos para cocinar.',
    'Para asados trae carbón, y papel aluminio si vas a usar el barril asador.',
    'Los menores de edad deben estar acompañados y bajo la responsabilidad de un adulto.',
  ],
  houseRules: [
    'Dentro de las cabañas está prohibido fumar y usar velas, encendedores, fósforos o cualquier elemento inflamable.',
    'Cualquier daño a las instalaciones, el mobiliario o los elementos del rancho lo asume el responsable de la reserva.',
  ],
  bookingTerms: [
    'Formas de pago: transferencia, consignación bancaria o efectivo.',
    'Para reservar: se separa la fecha con un abono mínimo del 50 %.',
    'Saldo: el resto se paga al llegar.',
    'Cancelaciones: con mínimo 3 días de anticipación reprogramamos tu reserva o te devolvemos el abono. Con menos de 2 días, o si no llegas, el abono no se reembolsa.',
    'Cambios de fecha: una sola vez, según disponibilidad.',
  ],
};

export const SETTING_KEYS = Object.keys(
  DEFAULT_SETTINGS,
) as (keyof HotelSettings)[];
