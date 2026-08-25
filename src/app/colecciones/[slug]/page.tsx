import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerPiezasSeguro, piezasDeColeccion } from "@/lib/productos";
import type { Pieza } from "@/lib/tipos";
import { MARCA, COLECCIONES_WEB, colorDePiedra } from "@/lib/site";
import { enlaceWhatsAppGeneral } from "@/lib/comercio";
import { jsonLdMiga, serializarJsonLd } from "@/lib/seo";
import { IconoWhatsApp } from "@/components/Marca";
import { TarjetaPieza } from "@/components/TarjetaPieza";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(COLECCIONES_WEB).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const coleccion = COLECCIONES_WEB[slug];
  if (!coleccion) return {};
  return {
    title: `Colección ${coleccion.nombre}`,
    description:
      coleccion.presentacion ||
      `Piezas de la colección ${coleccion.nombre} de ${MARCA.nombre}: ${MARCA.atributos.join(", ").toLowerCase()}.`,
    alternates: { canonical: `/colecciones/${slug}` },
  };
}

export default async function PaginaColeccion({ params }: Props) {
  const { slug } = await params;
  const coleccion = COLECCIONES_WEB[slug];
  if (!coleccion) notFound();

  const { piezas } = await obtenerPiezasSeguro();
  const propias = piezasDeColeccion(piezas, slug);

  const jsonLd = jsonLdMiga([
    { nombre: "Inicio", url: MARCA.url },
    { nombre: `Colección ${coleccion.nombre}`, url: `${MARCA.url}/colecciones/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }}
      />

      <section className="seccion" aria-labelledby="coleccion-h1">
        <div className="contenedor">
          <nav aria-label="Miga de pan">
            <ol className="miga" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li>
                <Link href="/">Inicio</Link>
              </li>
              <li aria-current="page">Colección {coleccion.nombre}</li>
            </ol>
          </nav>

          <div className="seccion__cabeza">
            <p className="eyebrow">Colección</p>
            <h1 id="coleccion-h1" className="seccion__titulo">
              {coleccion.nombre}
            </h1>
            {coleccion.presentacion ? (
              <p className="prosa" style={{ marginTop: "1rem" }}>
                {coleccion.presentacion}
              </p>
            ) : null}
            {coleccion.simbolo ? (
              <p className="prosa" style={{ marginTop: "1rem", color: "var(--oro-texto)" }}>
                {coleccion.simbolo}
              </p>
            ) : null}
          </div>

          {propias.length > 0 ? (
            <div className="rejilla rejilla--coleccion">
              {propias.map((p) => (
                <TarjetaPieza key={p.slug} pieza={p} />
              ))}
            </div>
          ) : (
            <p className="aviso">
              Las piezas de esta colección se están registrando. Escríbenos por WhatsApp y te
              las mostramos.
            </p>
          )}

          <p style={{ marginTop: "var(--e4)", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <a
              className="boton boton--secundario"
              href={enlaceWhatsAppGeneral(`coleccion-${slug}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconoWhatsApp />
              Escribir por WhatsApp
              <span className="solo-lectores">(se abre en una pestaña nueva)</span>
            </a>
            <Link className="enlace-discreto" href="/catalogo">
              Ver disponibilidad en el catálogo
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
