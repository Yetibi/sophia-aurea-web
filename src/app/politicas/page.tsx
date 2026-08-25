import type { Metadata } from "next";
import Link from "next/link";
import { POLITICAS } from "@/lib/politicas";

export const metadata: Metadata = {
  title: "Políticas",
  description: "Tratamiento de datos, envíos y garantía, y términos y condiciones de Sophia Auréa.",
  alternates: { canonical: "/politicas" },
};

export default function IndicePoliticas() {
  return (
    <section className="seccion">
      <div className="contenedor">
        <div className="seccion__cabeza">
          <p className="eyebrow">Información legal</p>
          <h1 className="seccion__titulo">Políticas de Sophia Auréa</h1>
        </div>
        <ul style={{ display: "grid", gap: "1rem", maxWidth: "40rem" }}>
          {POLITICAS.map((p) => (
            <li key={p.slug}>
              <Link className="pie__enlace" href={`/politicas/${p.slug}`} style={{ fontFamily: "var(--display)", fontSize: "var(--t-lg)" }}>
                {p.titulo}
              </Link>
              <p className="prosa" style={{ marginTop: "0.25rem" }}>{p.descripcion}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
