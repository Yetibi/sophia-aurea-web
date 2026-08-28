"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { srcDeFoto } from "@/lib/tipos";

export type CategoriaCarrusel = {
  slug: string;
  etiqueta: string;
  foto: string;
  fotoAlt: string;
};

/**
 * Fila de categorías que se desplaza en horizontal y se sale por el borde
 * derecho: la última tarjeta cortada insinúa que hay más.
 *
 * Componente de cliente: recibe las categorías ya resueltas desde el
 * servidor (productos.ts es server-only).
 */
export function CarruselCategorias({
  categorias,
  tituloId,
}: {
  categorias: CategoriaCarrusel[];
  tituloId: string;
}) {
  const pista = useRef<HTMLUListElement>(null);
  const [alInicio, setAlInicio] = useState(true);
  const [alFinal, setAlFinal] = useState(false);

  const revisarBordes = useCallback(() => {
    const el = pista.current;
    if (!el) return;
    // 2px de margen: los navegadores redondean el scroll a subpíxeles y
    // sin holgura el botón "siguiente" nunca llegaría a deshabilitarse.
    setAlInicio(el.scrollLeft <= 2);
    setAlFinal(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    revisarBordes();
    const el = pista.current;
    if (!el) return;
    el.addEventListener("scroll", revisarBordes, { passive: true });
    window.addEventListener("resize", revisarBordes);
    return () => {
      el.removeEventListener("scroll", revisarBordes);
      window.removeEventListener("resize", revisarBordes);
    };
  }, [revisarBordes]);

  const desplazar = (direccion: 1 | -1) => {
    const el = pista.current;
    if (!el) return;
    const tarjeta = el.querySelector("li");
    const paso = tarjeta ? tarjeta.getBoundingClientRect().width + 16 : el.clientWidth * 0.6;
    el.scrollBy({ left: paso * direccion, behavior: "smooth" });
  };

  if (categorias.length === 0) return null;

  return (
    <div className="categorias__carrusel">
      <div className="contenedor categorias__cabeza">
        <div>
          <p className="eyebrow">Explora por pieza</p>
          <h2 id={tituloId} className="seccion__titulo categorias__titulo">
            Nuestras piezas
          </h2>
          {/* Solo en móvil y solo si hay más tarjetas de las que caben */}
          {categorias.length > 1 ? (
            <p className="pista-desliza" aria-hidden="true">
              Desliza para ver más <span className="pista-desliza__flecha">→</span>
            </p>
          ) : null}
        </div>
        {/* Atajo de escritorio: en móvil sobra, el gesto táctil es natural */}
        <div className="categorias__controles">
          <button
            type="button"
            className="categorias__flecha"
            aria-label="Ver categorías anteriores"
            onClick={() => desplazar(-1)}
            disabled={alInicio}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            className="categorias__flecha"
            aria-label="Ver categorías siguientes"
            onClick={() => desplazar(1)}
            disabled={alFinal}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      <ul className="categorias__pista" ref={pista}>
        {categorias.map((c, i) => {
          const src = srcDeFoto(c.foto);
          return (
            <li key={c.slug} className="categorias__celda">
              <Link href={`/${c.slug}`} className="categoria">
                <span className="categoria__marco">
                  {src ? (
                    <Image
                      className="categoria__foto"
                      src={src}
                      alt={c.fotoAlt}
                      fill
                      sizes="(min-width: 62rem) 20rem, 60vw"
                      priority={i === 0}
                      unoptimized={/^https?:\/\//i.test(c.foto)}
                    />
                  ) : null}
                  <span className="categoria__velo" aria-hidden="true" />
                  <span className="categoria__pie">
                    <span className="categoria__nombre">{c.etiqueta}</span>
                    <span className="categoria__pildora">
                      Ver colección
                      <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

    </div>
  );
}
