/** Constantes de marca y navegacion. Un solo lugar para cambiarlas. */

export const MARCA = {
  nombre: "Sophia Auréa",
  tagline: "Joyería con Alma",
  atributos: ["Oro 18K", "Piedras Naturales", "Hecho con intención"],
  ciudad: "Medellín, Colombia",
  instagram: "sophiaaurea.joyas",
  instagramUrl: "https://instagram.com/sophiaaurea.joyas",
  url: process.env.NEXT_PUBLIC_SITIO_URL ?? "https://sophiaaurea.co",
} as const;

/**
 * Mantra de marca — copy validado (skill sophia-aurea-colecciones).
 * No se reescribe ni se parafrasea.
 */
export const MANTRA = [
  "Cada joya guarda una historia.",
  "Cada piedra refleja una intención.",
  "Cada amuleto acompaña un camino.",
] as const;

export const NAVEGACION = [
  { href: "/colecciones/fortuna", etiqueta: "Fortuna" },
  { href: "/colecciones/amuletos-del-mar", etiqueta: "Amuletos del Mar" },
  { href: "/catalogo", etiqueta: "Catálogo" },
] as const;

/**
 * Color de cada piedra. Es un token visual, no informacion:
 * el nombre de la piedra siempre acompana al color en texto, para que el dato
 * nunca dependa solo del color (WCAG 1.4.1).
 */
export const COLOR_PIEDRA: Record<string, string> = {
  "Zafiro Azul": "#2E5090",
  "Rubí": "#9B2335",
  "Esmeralda": "#2D6A4F",
  "Diamante": "#B9B3AA",
  "Amatista": "#6B4C8A",
  "Zafiro Rosa": "#C77D8A",
  Perla: "#E4DACB",
  Ónix: "#3A3A3A",
  "Zafiro Verde": "#2D6A4F",
  "Zafiro Naranja": "#C77A3A",
  "Zafiro Rosado": "#C77D8A",
  Moissanita: "#D8D4CE",
  "Diamante Verde": "#3E7C5A",
  Citrino: "#C9973A",
  Tanzanita: "#5A5AA0",
};

export function colorDePiedra(piedra: string): string {
  return COLOR_PIEDRA[piedra] ?? "#A08A6A";
}

/** Orden en que se presentan las piedras cuando estan disponibles. */
export const ORDEN_PIEDRAS = [
  "Zafiro Azul",
  "Rubí",
  "Esmeralda",
  "Diamante",
  "Amatista",
  "Zafiro Rosa",
];

export function ordenarPorPiedra(a: string, b: string): number {
  const ia = ORDEN_PIEDRAS.indexOf(a);
  const ib = ORDEN_PIEDRAS.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b, "es");
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}

/**
 * Copy de colección validado por la fundadora
 * (fuente: skill `sophia-aurea-colecciones`). No se reescribe.
 */
export const COLECCION_FORTUNA = {
  nombre: "Fortuna",
  piezaInsignia: "Elefante",
  presentacion:
    "SOPHIA AURÉA nace como homenaje a Sophia, símbolo de sabiduría, amor y legado. Cada joya es creada para acompañar momentos importantes de la vida, transformando símbolos ancestrales en piezas de lujo con significado.",
  simbolo:
    "Protección · Sabiduría · Buena fortuna · Fortaleza interior · Prosperidad · Lealtad · Estabilidad · Larga vida.",
  detalle:
    "Con la trompa orientada hacia arriba: símbolo de bendiciones, éxito y energía positiva.",
} as const;

/** Colecciones publicadas en el website v1, por slug de URL. */
export const COLECCIONES_WEB: Record<
  string,
  { nombre: string; presentacion: string; simbolo: string }
> = {
  fortuna: {
    nombre: "Fortuna",
    presentacion: COLECCION_FORTUNA.presentacion,
    simbolo: `${COLECCION_FORTUNA.simbolo} ${COLECCION_FORTUNA.detalle}`,
  },
  "amuletos-del-mar": {
    nombre: "Amuletos del Mar",
    // Presentación marco pendiente de texto validado de la fundadora.
    presentacion: "",
    simbolo: "",
  },
  "cor-aurea": {
    nombre: "Cor Aurea",
    // Corazones y piedras preciosas. Presentación pendiente de validación.
    presentacion: "",
    simbolo: "",
  },
};
