import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICULOS, articuloPorSlug } from "@/lib/articulos";

export function generateStaticParams() {
  return ARTICULOS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const articulo = articuloPorSlug(slug);
  if (!articulo) return {};
  return {
    title: articulo.titulo,
    description: `${articulo.categoria} — Sophia Auréa`,
    alternates: { canonical: `/mas-alla/${articulo.slug}` },
    // Sin cuerpo no hay nada que indexar; se levanta al publicar el texto
    robots: articulo.cuerpo ? undefined : { index: false, follow: true },
  };
}

export default async function PaginaArticulo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const articulo = articuloPorSlug(slug);
  if (!articulo) notFound();

  return (
    <article className="seccion">
      <div className="contenedor articulo-pagina">
        <p className="eyebrow">{articulo.categoria}</p>
        <h1 className="seccion__titulo">{articulo.titulo}</h1>

        {articulo.cuerpo ? (
          <p className="prosa">{articulo.cuerpo}</p>
        ) : (
          <p className="aviso">Este artículo está en preparación.</p>
        )}

        <p style={{ marginTop: "var(--e4)" }}>
          <Link className="enlace-discreto" href="/mas-alla">
            Ver todos los artículos
          </Link>
        </p>
      </div>
    </article>
  );
}
