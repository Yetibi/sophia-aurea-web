/**
 * Tipos compartidos entre servidor y cliente.
 * Vive aparte de productos.ts (que es server-only) para que los componentes
 * de cliente usen el tipo Pieza y el formateo sin arrastrar el secreto de Graph.
 */

export type Disponibilidad = "linea" | "limitada";

export type Pieza = {
  sku: string;
  /** URL estable. Viene de la columna slug o se genera de la descripción. */
  slug: string;
  /** Nombre comercial validado (columna "producto"). El H1 del sitio. */
  nombre: string;
  /** Descripción larga tipo "Dije tortuga piedra zafiro naranja forma cuadrada". */
  descripcion: string;
  figura: string;
  tipoPieza: string;
  coleccion: string;
  piedra: string;
  colorPiedra: string;
  formaPiedra: string;
  tamano: string;
  tamanoPiedraMm: string;
  dimensiones: string;
  material: string;
  frase: string;
  copyLargo: string;
  simboliza: string;
  mensaje: string;
  foto: string;
  fotoAlt: string;
  precioCop: number | null;
  disponibilidad: Disponibilidad | null;
  disponible: boolean;
  destacada: boolean;
};

export function formatearPrecio(cop: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(cop);
}

/** Etiqueta legible de disponibilidad para la interfaz. */
export function etiquetaDisponibilidad(d: Disponibilidad | null): string | null {
  if (d === "linea") return "De línea";
  if (d === "limitada") return "Edición limitada";
  return null;
}

/**
 * URL desde la que el sitio sirve la foto de una pieza.
 * `foto` puede venir como URL externa, como ruta completa de OneDrive
 * ("/01-Marca/fotografia/.../Pieza.jpg") o como nombre suelto. En los dos
 * últimos casos se sirve por /api/foto/, codificando cada segmento pero
 * preservando las barras.
 */
export function srcDeFoto(foto: string): string | null {
  if (!foto) return null;
  if (/^https?:\/\//i.test(foto)) return foto;
  const segmentos = foto
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `/api/foto/${segmentos}`;
}
