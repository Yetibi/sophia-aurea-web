import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  obtenerPiezasSeguro,
  piezasDeTipo,
  tiposDePiezaDisponibles,
} from "@/lib/productos";
import { MARCA } from "@/lib/site";
import { jsonLdMiga, serializarJsonLd } from "@/lib/seo";
import { CategoriaCliente } from "@/components/CategoriaCliente";
import { Cierre } from "@/components/Estructura";

export const revalidate = 300;

type Props = { params: Promise<{ tipo: string }> };

// Rutas reservadas que NO son categorías (tienen su propia carpeta/página).
const RESERVADAS = new Set(["catalogo", "colecciones", "joyas", "politicas", "api"]);

const TIPOS_CONOCIDOS_META: Record<string, string> = {
  dijes: "Dijes",
  aretes: "Aretes",
  anillos: "Anillos",
  pulseras: "Pulseras",
  topos: "Topos",
  medallas: "Medallas",
  cadenas: "Cadenas",
};

export async function generateStaticParams() {
  const { piezas } = await obtenerPiezasSeguro();
  return tiposDePiezaDisponibles(piezas).map((t) => ({ tipo: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tipo } = await params;
  const { piezas } = await obtenerPiezasSeguro();
  const info = tiposDePiezaDisponibles(piezas).find((t) => t.slug === tipo);
  const etiqueta = info?.etiqueta ?? TIPOS_CONOCIDOS_META[tipo];
  if (!etiqueta) return {};
  return {
    title: etiqueta,
    description: `${etiqueta} en oro Ley 750 y piedras naturales de ${MARCA.nombre}. Elige por piedra o colección.`,
    alternates: { canonical: `/${tipo}` },
  };
}

/** Tipos que el sitio reconoce siempre, aunque el catálogo no responda.
 *  Evita devolver 404 a Google por una caída temporal de Graph. */
const TIPOS_CONOCIDOS: Record<string, string> = {
  dijes: "Dijes",
  aretes: "Aretes",
  anillos: "Anillos",
  pulseras: "Pulseras",
  topos: "Topos",
  medallas: "Medallas",
  cadenas: "Cadenas",
};

export default async function PaginaCategoria({ params }: Props) {
  const { tipo } = await params;
  if (RESERVADAS.has(tipo)) notFound();

  const { piezas, error } = await obtenerPiezasSeguro();
  const desdeDatos = tiposDePiezaDisponibles(piezas).find((t) => t.slug === tipo);

  // Si el catálogo respondió bien y el tipo no existe, sí es un 404 real.
  // Si el catálogo falló, la página existe pero se muestra sin piezas.
  const etiquetaConocida = TIPOS_CONOCIDOS[tipo];
  if (!desdeDatos && !etiquetaConocida) notFound();
  if (!desdeDatos && !error) notFound();

  const info = desdeDatos ?? { slug: tipo, etiqueta: etiquetaConocida };
  const propias = piezasDeTipo(piezas, tipo);

  const jsonLd = jsonLdMiga([
    { nombre: "Inicio", url: MARCA.url },
    { nombre: info.etiqueta, url: `${MARCA.url}/${tipo}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }}
      />

      <section className="seccion" aria-labelledby="cat-titulo">
        <div className="contenedor">
          <nav aria-label="Miga de pan">
            <ol className="miga" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li>
                <Link href="/">Inicio</Link>
              </li>
              <li aria-current="page">{info.etiqueta}</li>
            </ol>
          </nav>

          <div className="seccion__cabeza">
            <p className="eyebrow">Catálogo</p>
            <h1 id="cat-titulo" className="seccion__titulo">
              {info.etiqueta}
            </h1>
            <p className="prosa" style={{ marginTop: "1rem" }}>
              Cada pieza guarda un símbolo. Elige por la piedra o la figura, y
              escríbenos para conocer disponibilidad y tiempos de entrega.
            </p>
          </div>

          {propias.length > 0 ? (
            <CategoriaCliente piezas={propias} />
          ) : (
            <p className="aviso">
              {error
                ? "El catálogo no está disponible en este momento. Escríbenos por WhatsApp y te mostramos las piezas."
                : "Estamos registrando estas piezas. Escríbenos por WhatsApp y te las mostramos."}
            </p>
          )}
        </div>
      </section>

      <Cierre />
    </>
  );
}
