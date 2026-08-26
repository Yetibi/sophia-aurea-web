/**
 * Lee TablaProductos desde Excel (OneDrive) vía Graph y la convierte en piezas
 * tipadas. Las columnas se mapean POR NOMBRE de encabezado (sin tildes ni
 * mayúsculas, con alias), no por posición: Verónica puede reordenar o agregar
 * columnas sin romper el sitio.
 *
 * Regla de marca: el copy sale del Excel, que edita la fundadora. El sitio
 * nunca inventa significados: celda vacía = bloque que no se muestra.
 */

import "server-only";
import { graphJson, rutaDriveCatalogo } from "./graph";
import { canonizarPiedra, canonizarColeccion } from "./site";
import type { Pieza, Disponibilidad } from "./tipos";

export type { Pieza } from "./tipos";

/** Encabezados aceptados por campo. Mapea a las columnas reales del Excel de la marca. */
const ALIAS: Record<string, string[]> = {
  sku: ["sku", "id", "codigo", "id_producto", "referencia"],
  slug: ["slug", "url"],
  nombre: ["producto", "nombre", "nombre_pieza", "titulo"],
  descripcion: ["descripcion", "detalle"],
  figura: ["figura", "simbolo"],
  tipoPieza: ["tipo_pieza", "tipo", "tipopieza"],
  coleccion: ["coleccion"],
  piedra: ["piedra"],
  colorPiedra: ["color_piedra", "colorpiedra", "color"],
  formaPiedra: ["forma_piedra", "formapiedra", "forma"],
  tamano: ["tamano", "tamaño", "talla"],
  tamanoPiedraMm: ["tamano_piedra_mm", "tamano_piedra", "medida_piedra"],
  dimensiones: ["dimensiones", "medidas"],
  material: ["material"],
  frase: ["frase_ancla", "frase", "fraseancla"],
  copyLargo: ["copy_largo", "copylargo", "descripcion_larga", "historia"],
  simboliza: ["simboliza", "simbolismo"],
  mensaje: ["mensaje", "mensaje_final"],
  foto: ["ruta_foto", "foto", "imagen", "foto_principal", "url_foto"],
  fotoAlt: ["foto_alt", "alt", "texto_alternativo"],
  precioCop: ["precio_venta_cop", "precio_cop", "precio", "preciocop", "precio_venta"],
  disponibilidad: ["tipo_disponibilidad", "disponibilidad", "linea"],
  disponible: ["cargar_catalogo", "cargarcatalogo", "disponible", "activo", "publicar"],
  destacada: ["destacada", "destacado"],
};

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function aTexto(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  return String(valor).trim();
}

/** Excel puede devolver el precio como número o como texto "3.257.800" / "3257800,50". */
function aNumero(valor: unknown): number | null {
  if (typeof valor === "number" && Number.isFinite(valor)) return valor;
  const texto = aTexto(valor);
  if (!texto) return null;
  const limpio = texto.replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

function aBooleano(valor: unknown, porDefecto: boolean): boolean {
  if (typeof valor === "boolean") return valor;
  const t = normalizar(aTexto(valor));
  if (!t) return porDefecto;
  if (["si", "true", "1", "x", "verdadero", "activo"].includes(t)) return true;
  if (["no", "false", "0", "falso", "inactivo"].includes(t)) return false;
  return porDefecto;
}

function aDisponibilidad(valor: unknown): Disponibilidad | null {
  const t = normalizar(aTexto(valor));
  if (!t) return null;
  if (["linea", "de_linea", "permanente", "fija"].includes(t)) return "linea";
  if (["limitada", "edicion_limitada", "temporal", "rotativo", "rotativa"].includes(t)) return "limitada";
  return null;
}

function generarSlug(texto: string): string {
  return normalizar(texto).replace(/_/g, "-").replace(/[^a-z0-9-]/g, "");
}

type RespuestaRango = { values: unknown[][] };
type RespuestaFilas = { value: { values: unknown[][] }[] };

function mapearColumnas(encabezado: unknown[]): Record<string, number> {
  const norm = encabezado.map((c) => normalizar(aTexto(c)));
  const indice: Record<string, number> = {};
  for (const campo of Object.keys(ALIAS)) {
    const pos = norm.findIndex((c) => ALIAS[campo].includes(c));
    if (pos >= 0) indice[campo] = pos;
  }
  return indice;
}

function construirPieza(fila: unknown[], idx: Record<string, number>): Pieza | null {
  const leer = (campo: string): unknown => {
    const i = idx[campo];
    return i === undefined ? undefined : fila[i];
  };

  const nombre = aTexto(leer("nombre"));
  const descripcion = aTexto(leer("descripcion"));
  const sku = aTexto(leer("sku"));
  if (!nombre && !descripcion && !sku) return null; // fila vacía

  const nombreFinal = nombre || descripcion || sku;
  // El Excel se llena a mano: "Rubi" y "Rubí" son la misma piedra
  const piedra = canonizarPiedra(aTexto(leer("piedra")));
  const tipoPieza = aTexto(leer("tipoPieza")) || "Pieza";
  const slugManual = generarSlug(aTexto(leer("slug")));
  const precio = aNumero(leer("precioCop"));

  return {
    sku: sku || generarSlug(nombreFinal),
    slug: slugManual || generarSlug(nombreFinal),
    nombre: nombreFinal,
    descripcion,
    figura: aTexto(leer("figura")),
    tipoPieza,
    // Como con la piedra: "Arcangeles" y "Arcángeles" son la misma colección
    coleccion: canonizarColeccion(aTexto(leer("coleccion"))) || "Sophia Auréa",
    piedra,
    colorPiedra: aTexto(leer("colorPiedra")),
    formaPiedra: aTexto(leer("formaPiedra")),
    tamano: aTexto(leer("tamano")),
    tamanoPiedraMm: aTexto(leer("tamanoPiedraMm")),
    dimensiones: aTexto(leer("dimensiones")),
    material: aTexto(leer("material")) || "Oro Ley 750",
    frase: aTexto(leer("frase")),
    copyLargo: aTexto(leer("copyLargo")),
    simboliza: aTexto(leer("simboliza")),
    mensaje: aTexto(leer("mensaje")),
    foto: aTexto(leer("foto")),
    fotoAlt:
      aTexto(leer("fotoAlt")) ||
      [tipoPieza, nombreFinal, piedra && `con ${piedra.toLowerCase()}`, "en oro Ley 750"]
        .filter(Boolean)
        .join(" "),
    precioCop: precio,
    disponibilidad: aDisponibilidad(leer("disponibilidad")),
    disponible: aBooleano(leer("disponible"), true),
    destacada: aBooleano(leer("destacada"), false),
  };
}

export const ETIQUETA_CATALOGO = "catalogo";

export async function obtenerPiezas(): Promise<Pieza[]> {
  const tabla = process.env.CATALOGO_TABLA ?? "TablaProductos";
  const base = `${rutaDriveCatalogo()}/workbook/tables/${encodeURIComponent(tabla)}`;

  const [encabezado, filas] = await Promise.all([
    graphJson<RespuestaRango>(`${base}/headerRowRange?$select=values`, {
      revalidar: 300,
      etiquetas: [ETIQUETA_CATALOGO],
    }),
    graphJson<RespuestaFilas>(`${base}/rows?$top=500&$select=values`, {
      revalidar: 300,
      etiquetas: [ETIQUETA_CATALOGO],
    }),
  ]);

  const idx = mapearColumnas(encabezado.values?.[0] ?? []);
  const piezas = filas.value
    .map((f) => construirPieza(f.values?.[0] ?? [], idx))
    .filter((p): p is Pieza => p !== null)
    .filter((p) => p.disponible);

  return desambiguarSlugs(piezas);
}

/**
 * Garantiza un slug único por pieza.
 *
 * Varias piezas del catálogo comparten nombre (dos "Dije elefante zafiro
 * piedra verde" que se distinguen por tamaño o peso), y el slug se deriva
 * del nombre: sin esto quedan URLs duplicadas y React marca claves
 * repetidas. La primera conserva el slug limpio para no romper enlaces ya
 * publicados; las siguientes se sufijan con su SKU, que sí es único.
 */
function desambiguarSlugs(piezas: Pieza[]): Pieza[] {
  const vistos = new Set<string>();
  return piezas.map((p) => {
    if (!vistos.has(p.slug)) {
      vistos.add(p.slug);
      return p;
    }
    let candidato = `${p.slug}-${generarSlug(p.sku)}`;
    // Si hasta el SKU se repite, se numera: nunca dos claves iguales
    let n = 2;
    while (vistos.has(candidato)) candidato = `${p.slug}-${generarSlug(p.sku)}-${n++}`;
    vistos.add(candidato);
    return { ...p, slug: candidato };
  });
}

/** Igual que obtenerPiezas pero nunca lanza: la portada debe verse aunque Graph falle. */
export async function obtenerPiezasSeguro(): Promise<{ piezas: Pieza[]; error: string | null }> {
  try {
    return { piezas: await obtenerPiezas(), error: null };
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : String(e);
    console.error("[catalogo] no se pudo leer TablaProductos:", mensaje);
    return { piezas: [], error: mensaje };
  }
}

/* ── Utilidades de agrupación ─────────────────────────────── */

export function slugDeColeccion(nombre: string): string {
  return generarSlug(nombre);
}

/**
 * Pluraliza el tipo de pieza para la URL, con reglas del español.
 * Los tipos que ya son frase ("Punto de luz") o no se pluralizan bien
 * automáticamente se declaran aquí para no generar URLs como
 * "/punto-de-luzs".
 */
const PLURALES: Record<string, string> = {
  "punto-de-luz": "puntos-de-luz",
  dije: "dijes",
  arete: "aretes",
  anillo: "anillos",
  pulsera: "pulseras",
  topo: "topos",
  medalla: "medallas",
  cadena: "cadenas",
  collar: "collares",
  tobillera: "tobilleras",
};

export function slugDeTipo(tipoPieza: string): string {
  const base = generarSlug(tipoPieza);
  if (!base) return base;
  if (PLURALES[base]) return PLURALES[base];
  // Si ya viene en plural en el Excel, se respeta.
  if (Object.values(PLURALES).includes(base)) return base;
  if (base.endsWith("s")) return base;
  // Palabra terminada en consonante → "es" (más natural en español).
  return /[aeiou]$/.test(base) ? base + "s" : base + "es";
}

/** Etiqueta legible del tipo para menú y títulos, a partir del slug. */
export function etiquetaDeTipo(tipoPieza: string): string {
  const slug = slugDeTipo(tipoPieza);
  return slug
    .split("-")
    .map((p, i) => (i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p))
    .join(" ");
}

export function piezasDeColeccion(piezas: Pieza[], slugColeccion: string): Pieza[] {
  return piezas.filter((p) => slugColeccion === slugDeColeccion(p.coleccion));
}

export function piezasDeTipo(piezas: Pieza[], slugTipo: string): Pieza[] {
  return piezas.filter((p) => slugTipo === slugDeTipo(p.tipoPieza));
}

/** Tipos de pieza presentes en el catálogo, para generar la navegación sola. */
export function tiposDePiezaDisponibles(piezas: Pieza[]): { slug: string; etiqueta: string }[] {
  const mapa = new Map<string, string>();
  for (const p of piezas) {
    if (!p.tipoPieza) continue;
    const slug = slugDeTipo(p.tipoPieza);
    if (!mapa.has(slug)) mapa.set(slug, etiquetaDeTipo(p.tipoPieza));
  }
  return [...mapa.entries()].map(([slug, etiqueta]) => ({ slug, etiqueta }));
}

export { formatearPrecio } from "./tipos";
