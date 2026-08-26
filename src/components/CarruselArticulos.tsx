"use client";

import Link from "next/link";

export type TarjetaArticulo = {
  slug: string;
  categoria: string;
  titulo: string;
};

/**
 * Fila de artículos con desplazamiento horizontal, misma mecánica que la de
 * categorías: se desborda por la derecha para insinuar que hay más.
 *
 * Componente de cliente solo por el desplazamiento táctil; las fotos ya
 * vienen resueltas desde el servidor.
 */
export function CarruselArticulos({ articulos }: { articulos: TarjetaArticulo[] }) {
  if (articulos.length === 0) return null;

  return (
    <ul className="articulos__pista">
      {articulos.map((a) => (
        <li key={a.slug} className="articulos__celda">
          <Link href={`/mas-alla/${a.slug}`} className="articulo">
            {/* Marco en blanco a la espera de la fotografía definitiva: una
                foto de producto prestada aquí confundiría el contenido. */}
            <span className="articulo__marco articulo__marco--vacio">
              <span className="articulo__pie">
                <span className="articulo__categoria">{a.categoria}</span>
                <span className="articulo__titulo">{a.titulo}</span>
                {/* <span> y no <a>: la tarjeta entera ya es el enlace */}
                <span className="articulo__leer">Leer más</span>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
