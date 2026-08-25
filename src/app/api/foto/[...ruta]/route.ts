import { NextResponse } from "next/server";
import { graphJson, obtenerToken, usuarioOneDrive, carpetasDeFotos, GRAPH } from "@/lib/graph";

/**
 * Sirve una foto de producto desde OneDrive.
 *
 * La columna `ruta_foto` del Excel guarda una RUTA COMPLETA, no solo el
 * nombre de archivo, por ejemplo:
 *   /01-Marca/fotografia/Fotografia productos julio 29 - 1 pdn/Pieza.jpg
 *
 * Esa ruta es relativa a la carpeta raíz de trabajo de la marca (SOI), no a
 * la raíz del OneDrive. Por eso se prueban varias resoluciones en orden:
 *   1. la ruta tal cual desde la raíz del OneDrive
 *   2. la ruta con el prefijo base (FOTOS_BASE, por defecto "SOI")
 *   3. solo el nombre del archivo dentro de cada carpeta de PHOTOS_FOLDER
 *
 * Así el sitio tolera que el Excel guarde la ruta con o sin prefijo.
 */

const TIPOS: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

type DriveItem = {
  "@microsoft.graph.downloadUrl"?: string;
  file?: { mimeType?: string };
};

/** Codifica cada segmento por separado, preservando las barras de la ruta. */
function codificarRuta(ruta: string): string {
  return ruta
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
}

export async function GET(
  _peticion: Request,
  { params }: { params: Promise<{ ruta: string[] }> },
) {
  const { ruta } = await params;
  const rutaCruda = ruta.map((s) => decodeURIComponent(s)).join("/");

  // Nunca permitir salir de la carpeta: es la única restricción de seguridad.
  if (!rutaCruda || rutaCruda.includes("..") || rutaCruda.includes("\\")) {
    console.error("[foto] ruta no válida:", rutaCruda);
    return NextResponse.json({ error: "Ruta no válida" }, { status: 400 });
  }

  const extension = rutaCruda.split(".").pop()?.toLowerCase() ?? "";
  if (!TIPOS[extension]) {
    console.error("[foto] formato no admitido:", rutaCruda);
    return NextResponse.json({ error: "Formato de imagen no admitido" }, { status: 400 });
  }

  let upn: string;
  try {
    upn = usuarioOneDrive();
  } catch {
    return NextResponse.json({ error: "OneDrive sin configurar" }, { status: 503 });
  }

  const limpia = rutaCruda.replace(/^\/+/, "");
  const base = (process.env.FOTOS_BASE ?? "SOI").replace(/^\/+|\/+$/g, "");
  const soloNombre = limpia.split("/").pop() ?? limpia;

  const candidatas = [
    limpia,
    base ? `${base}/${limpia}` : null,
    ...carpetasDeFotos().map((c) => `${c}/${soloNombre}`),
  ].filter((v): v is string => Boolean(v));

  for (const rutaRelativa of candidatas) {
    const endpoint = `/users/${encodeURIComponent(upn)}/drive/root:/${codificarRuta(rutaRelativa)}`;
    try {
      const item = await graphJson<DriveItem>(endpoint, { revalidar: 3600 });
      const enlace = item["@microsoft.graph.downloadUrl"];

      const respuesta = enlace
        ? await fetch(enlace, { next: { revalidate: 3600 } })
        : await fetch(`${GRAPH}${endpoint}:/content`, {
            headers: { Authorization: `Bearer ${await obtenerToken()}` },
            next: { revalidate: 3600 },
          });

      if (!respuesta.ok || !respuesta.body) continue;

      return new NextResponse(respuesta.body, {
        status: 200,
        headers: {
          "Content-Type": item.file?.mimeType ?? TIPOS[extension],
          "Cache-Control":
            "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        },
      });
    } catch {
      continue; // No está en esta ubicación: se prueba la siguiente.
    }
  }

  console.error("[foto] no encontrada. Rutas probadas:", candidatas.join(" | "));
  return NextResponse.json({ error: "No se encontró la imagen" }, { status: 404 });
}
