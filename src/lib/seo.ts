/**
 * Datos estructurados (JSON-LD) renderizados EN SERVIDOR, para que estén en
 * el HTML estático que Google lee — requisito #2 de la auditoría SEO.
 * Sin precio en v1 (flag de precios apagado); se añade "offers" cuando la
 * marca decida mostrar precios o active la pasarela.
 */

import type { Pieza } from "./tipos";
import { MARCA } from "./site";

export function jsonLdOrganizacion() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: MARCA.nombre,
    url: MARCA.url,
    slogan: MARCA.tagline,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Medellín",
      addressCountry: "CO",
    },
    sameAs: [MARCA.instagramUrl],
  };
}

export function jsonLdPieza(pieza: Pieza, urlAbsoluta: string, urlFoto?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pieza.nombre,
    description:
      pieza.frase || `${pieza.tipoPieza} ${pieza.figura} con ${pieza.piedra} en ${pieza.material}.`,
    url: urlAbsoluta,
    ...(urlFoto ? { image: urlFoto } : {}),
    sku: pieza.sku,
    brand: { "@type": "Brand", name: MARCA.nombre },
    material: pieza.material,
    ...(pieza.coleccion
      ? { isPartOf: { "@type": "ProductCollection", name: `Colección ${pieza.coleccion}` } }
      : {}),
  };
}

export function jsonLdMiga(pasos: { nombre: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: pasos.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.nombre,
      item: p.url,
    })),
  };
}

/** Serializa JSON-LD de forma segura para inyectar en <script>. */
export function serializarJsonLd(datos: unknown): string {
  return JSON.stringify(datos).replace(/</g, "\\u003c");
}
