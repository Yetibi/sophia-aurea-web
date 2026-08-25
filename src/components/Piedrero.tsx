"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { colorDePiedra } from "@/lib/site";

export type EntradaPiedra = {
  piedra: string;
  /** Slug de la pieza representante, para enlazar a /joyas/[slug]. */
  slug: string;
  /** Nombre validado de la variante, p. ej. "El Guardián de la Sabiduría". */
  nombre: string;
  frase: string;
  simboliza: string;
};

/**
 * Elemento firma del sitio: la piedra como índice de la colección.
 *
 * En Sophia Auréa el significado no vive en la joya sino en la piedra, y cada
 * piedra tiene su territorio propio. Por eso la navegación de la portada no es
 * una grilla de fotos: es una fila de piedras, y elegir una cambia la frase y
 * el tinte de la sección.
 *
 * Accesibilidad: son botones de alternancia (aria-pressed), no pestañas —
 * no navegan, filtran una vista. El panel se anuncia con aria-live="polite"
 * para que un lector de pantalla oiga el cambio sin perder el foco.
 */
export function Piedrero({ entradas }: { entradas: EntradaPiedra[] }) {
  const idPanel = useId();
  const [activa, setActiva] = useState(0);

  if (entradas.length === 0) return null;

  const actual = entradas[activa];
  const color = colorDePiedra(actual.piedra);

  return (
    <div className="piedrero" style={{ ["--piedra" as string]: color }}>
      <h3 id={`${idPanel}-titulo`} className="eyebrow" style={{ marginBottom: "1rem" }}>
        Elige una piedra
      </h3>

      <ul className="piedrero__lista" aria-labelledby={`${idPanel}-titulo`}>
        {entradas.map((e, i) => (
          <li key={e.piedra}>
            <button
              type="button"
              className="piedra-boton"
              aria-pressed={i === activa}
              aria-controls={idPanel}
              onClick={() => setActiva(i)}
            >
              <span
                className="piedra-boton__gema"
                style={{ ["--gema" as string]: colorDePiedra(e.piedra) }}
                aria-hidden="true"
              />
              {e.piedra}
            </button>
          </li>
        ))}
      </ul>

      <div className="piedrero__panel" id={idPanel} aria-live="polite">
        <h4 className="piedrero__nombre">{actual.nombre}</h4>

        {actual.frase ? <p className="piedrero__frase">{actual.frase}</p> : null}

        {actual.simboliza ? <p className="piedrero__simboliza">{actual.simboliza}</p> : null}

        <p>
          <Link
            className="boton boton--secundario"
            href={`/joyas/${actual.slug}`}
          >
            Conocer esta pieza
          </Link>
        </p>
      </div>
    </div>
  );
}
