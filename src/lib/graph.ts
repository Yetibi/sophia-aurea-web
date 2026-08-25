/**
 * Cliente minimo de Microsoft Graph.
 *
 * Autentica con client_credentials (app-only): el sitio lee el catalogo con su
 * propia identidad, no con la sesion de una persona. Eso permite que la pagina
 * se genere en el servidor y se cachee, sin pedirle login a nadie.
 *
 * Este modulo NUNCA debe importarse desde un componente de cliente:
 * el secreto solo puede vivir en el servidor.
 */

import "server-only";

const AUTORIDAD = "https://login.microsoftonline.com";
export const GRAPH = "https://graph.microsoft.com/v1.0";

type TokenEnCache = { valor: string; expiraEn: number };
let tokenEnCache: TokenEnCache | null = null;

/**
 * Lee la primera variable de entorno que exista entre varios nombres posibles.
 * Acepta tanto la convencion MS_* como AZURE_*, porque el catalogo en
 * produccion ya usa AZURE_* y ambos proyectos comparten credenciales.
 */
function requerido(...nombres: string[]): string {
  for (const n of nombres) {
    const v = process.env[n];
    if (v) return v;
  }
  throw new Error(
    `Falta la variable de entorno ${nombres.join(" o ")}. Revisa .env.local (local) o las Environment Variables de Vercel (produccion).`,
  );
}

/** Devuelve un token de aplicacion, reutilizandolo mientras siga vigente. */
export async function obtenerToken(): Promise<string> {
  const ahora = Date.now();
  if (tokenEnCache && tokenEnCache.expiraEn > ahora + 60_000) {
    return tokenEnCache.valor;
  }

  const tenant = requerido("MS_TENANT_ID", "AZURE_TENANT_ID");
  const cuerpo = new URLSearchParams({
    client_id: requerido("MS_CLIENT_ID", "AZURE_CLIENT_ID"),
    client_secret: requerido("MS_CLIENT_SECRET", "AZURE_CLIENT_SECRET"),
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  // Importante: NO se usa cache:"no-store" aquí. Ese modo marca toda la
  // página que lo invoque como dinámica y rompe el prerenderizado estático
  // de /joyas/[slug]. El token ya se cachea en memoria (tokenEnCache), así
  // que basta con una revalidación corta en la capa de fetch.
  const res = await fetch(`${AUTORIDAD}/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: cuerpo,
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    const detalle = await res.text();
    throw new Error(`No se pudo obtener el token de Graph (${res.status}): ${detalle}`);
  }

  const datos = (await res.json()) as { access_token: string; expires_in: number };
  tokenEnCache = {
    valor: datos.access_token,
    expiraEn: ahora + datos.expires_in * 1000,
  };
  return datos.access_token;
}

type OpcionesGraph = {
  /** Segundos que Next puede reutilizar la respuesta. 0 = sin cache. */
  revalidar?: number;
  etiquetas?: string[];
};

/** GET contra Graph que devuelve JSON ya tipado. */
export async function graphJson<T>(ruta: string, opciones: OpcionesGraph = {}): Promise<T> {
  const token = await obtenerToken();
  const { revalidar = 300, etiquetas = [] } = opciones;

  const res = await fetch(`${GRAPH}${ruta}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: revalidar > 0 ? { revalidate: revalidar, tags: etiquetas } : undefined,
    ...(revalidar === 0 ? { cache: "no-store" as const } : {}),
  });

  if (!res.ok) {
    const detalle = await res.text();
    throw new Error(`Graph respondio ${res.status} en ${ruta}: ${detalle}`);
  }
  return (await res.json()) as T;
}

/** Correo del dueno del OneDrive donde viven Excel y fotos. */
export function usuarioOneDrive(): string {
  return requerido("ONEDRIVE_USER_EMAIL", "CATALOGO_UPN");
}

/**
 * Prefijo de la unidad de OneDrive donde vive el Excel del catalogo.
 * EXCEL_CARPETA es opcional: si el archivo no esta en la raiz del OneDrive,
 * se indica la carpeta (ej. "SOI/02-Operacion").
 */
export function rutaDriveCatalogo(): string {
  const upn = usuarioOneDrive();
  const archivo = requerido("EXCEL_FILE_NAME", "CATALOGO_ARCHIVO");
  const carpeta = (process.env.EXCEL_CARPETA ?? "").replace(/^\/+|\/+$/g, "");
  const ruta = carpeta ? `${carpeta}/${archivo}` : archivo;
  return `/users/${encodeURIComponent(upn)}/drive/root:/${encodeURI(ruta)}:`;
}

/**
 * Carpetas de OneDrive donde buscar las fotos de producto.
 * PHOTOS_FOLDER admite varias rutas separadas por coma: el sitio busca el
 * archivo en cada una, en orden, hasta encontrarlo.
 */
export function carpetasDeFotos(): string[] {
  const crudo = process.env.PHOTOS_FOLDER ?? process.env.SHAREPOINT_CARPETA ?? "";
  return crudo
    .split(",")
    .map((c) => c.trim().replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);
}
