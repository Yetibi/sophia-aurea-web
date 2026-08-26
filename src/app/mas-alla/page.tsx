import type { Metadata } from "next";
import Link from "next/link";
import { ARTICULOS } from "@/lib/articulos";

export const metadata: Metadata = {
  title: "Más allá de la pieza",
  description:
    "Cuidado, símbolos y el oficio detrás de cada joya de Sophia Auréa.",
  alternates: { canonical: "/mas-alla" },
  // Los artículos aún no tienen texto: publicar páginas vacías en Google
  // resta credibilidad al dominio. Se quita cuando haya contenido real.
  robots: { index: false, follow: true },
};

export default function IndiceMasAlla() {
  return (
    <section className="seccion">
      <div className="contenedor">
        <div className="seccion__cabeza">
          <p className="eyebrow">Más allá de la pieza</p>
          <h1 className="seccion__titulo">Cuidado, símbolos y oficio</h1>
          <p className="prosa">
            Historias sobre el cuidado de tus joyas, el significado de las
            piedras y el trabajo detrás de cada pieza.
          </p>
        </div>

        <ul className="indice-articulos">
          {ARTICULOS.map((a) => (
            <li key={a.slug} className="indice-articulos__fila">
              <p className="eyebrow">{a.categoria}</p>
              <h2 className="indice-articulos__titulo">
                <Link className="indice-articulos__enlace" href={`/mas-alla/${a.slug}`}>
                  {a.titulo}
                </Link>
              </h2>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
