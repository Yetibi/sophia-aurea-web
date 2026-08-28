"use client";

import Image from "next/image";
import Link from "next/link";
import { srcDeFoto } from "@/lib/tipos";

export type GrupoColeccion = {
  coleccion: string;
  slug: string;
  foto: string;
  fotoAlt: string;
  /** Marca interna del servidor: la portada ya vino de una pieza destacada. */
  fotoDestacada?: boolean;
  totalPiezas: number;
};

/**
 * Explora por colección: solo los círculos, como acceso a cada colección.
 *
 * No muestra piezas en el home a propósito — con las secciones de categorías
 * y de piedra ya hay dos rejillas arriba y una tercera lo satura. Cada
 * círculo lleva a su página de colección, donde las piezas sí se despliegan.
 */
export function ExploraPorColeccion({ grupos }: { grupos: GrupoColeccion[] }) {
  if (grupos.length === 0) return null;

  return (
    <div className="contenedor">
      <div className="colecciones__cabeza">
        <p className="eyebrow">Mundos propios</p>
        <h2 id="colecciones-titulo" className="seccion__titulo">
          Explora por colección
        </h2>
        {/* Solo se muestra en móvil y solo si hay más de las que caben: en
            escritorio los botones ‹ › ya cumplen esta función. */}
        {grupos.length > 2 ? (
          <p className="pista-desliza" aria-hidden="true">
            Desliza para ver más <span className="pista-desliza__flecha">→</span>
          </p>
        ) : null}
      </div>

      <ul className="colecciones__pista">
        {grupos.map((g) => {
          const src = srcDeFoto(g.foto);
          return (
            <li key={g.slug}>
              <Link
                href={`/colecciones/${g.slug}`}
                className="colecciones__opcion"
              >
                <span className="colecciones__circulo">
                  {src ? (
                    <Image
                      className="colecciones__foto"
                      src={src}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(min-width: 48rem) 240px, 200px"
                      unoptimized={/^https?:\/\//i.test(g.foto)}
                    />
                  ) : null}
                </span>
                <span className="colecciones__nombre">{g.coleccion}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
