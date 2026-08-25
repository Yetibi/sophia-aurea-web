import type { MetadataRoute } from "next";
import { MARCA, COLECCIONES_WEB } from "@/lib/site";
import { obtenerPiezasSeguro, tiposDePiezaDisponibles } from "@/lib/productos";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ahora = new Date();
  const { piezas } = await obtenerPiezasSeguro();
  const tipos = tiposDePiezaDisponibles(piezas);

  return [
    { url: MARCA.url, lastModified: ahora, priority: 1 },
    ...tipos.map((t) => ({
      url: `${MARCA.url}/${t.slug}`,
      lastModified: ahora,
      priority: 0.9,
    })),
    ...Object.keys(COLECCIONES_WEB).map((slug) => ({
      url: `${MARCA.url}/colecciones/${slug}`,
      lastModified: ahora,
      priority: 0.85,
    })),
    ...piezas.map((p) => ({
      url: `${MARCA.url}/joyas/${p.slug}`,
      lastModified: ahora,
      priority: 0.8,
    })),
    { url: `${MARCA.url}/catalogo`, lastModified: ahora, priority: 0.6 },
    { url: `${MARCA.url}/politicas`, lastModified: ahora, priority: 0.3 },
    { url: `${MARCA.url}/politicas/tratamiento-de-datos`, lastModified: ahora, priority: 0.3 },
    { url: `${MARCA.url}/politicas/envios-y-devoluciones`, lastModified: ahora, priority: 0.3 },
    { url: `${MARCA.url}/politicas/terminos-y-condiciones`, lastModified: ahora, priority: 0.3 },
  ];
}
