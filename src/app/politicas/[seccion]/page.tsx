import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POLITICAS, politicaPorSlug } from "@/lib/politicas";

type Props = { params: Promise<{ seccion: string }> };

export function generateStaticParams() {
  return POLITICAS.map((p) => ({ seccion: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seccion } = await params;
  const politica = politicaPorSlug(seccion);
  if (!politica) return {};
  return {
    title: politica.titulo,
    description: politica.descripcion,
    alternates: { canonical: `/politicas/${politica.slug}` },
  };
}

export default async function PaginaPolitica({ params }: Props) {
  const { seccion } = await params;
  const politica = politicaPorSlug(seccion);
  if (!politica) notFound();

  return (
    <section className="seccion">
      <div className="contenedor" style={{ maxWidth: "48rem" }}>
        <p className="eyebrow">Información legal</p>
        <h1 className="seccion__titulo">{politica.titulo}</h1>
        {politica.secciones.map((s) => (
          <section key={s.titulo} style={{ marginTop: "2.5rem" }}>
            <h2 style={{ fontSize: "var(--t-lg)", marginBottom: "0.75rem" }}>{s.titulo}</h2>
            {s.parrafos.map((texto, i) => (
              <p key={i} className="prosa" style={{ marginBottom: "1rem", maxWidth: "68ch" }}>
                {texto}
              </p>
            ))}
          </section>
        ))}
        <p style={{ marginTop: "3rem" }}>
          <Link className="pie__enlace" href="/politicas">
            Ver todas las políticas
          </Link>
        </p>
      </div>
    </section>
  );
}
