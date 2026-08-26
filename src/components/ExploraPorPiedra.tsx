"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Pieza } from "@/lib/tipos";
import { colorDePiedra } from "@/lib/site";
import { TarjetaPieza } from "./TarjetaPieza";

const MAXIMO_EN_REJILLA = 8;

export type GrupoPiedra = {
  piedra: string;
  /** Frase ancla validada de la primera pieza. Vacía = no se muestra nada. */
  frase: string;
  slugCategoria: string;
  piezas: Pieza[];
};

/**
 * Explora por piedra: filtra la rejilla sin cambiar de página.
 *
 * Componente de cliente: recibe los grupos ya armados desde el servidor
 * (productos.ts es server-only).
 *
 * Las píldoras son botones de alternancia con aria-pressed, no pestañas
 * ARIA: filtran una rejilla, no cambian de panel. Usar role="tab" aquí
 * prometería a un lector de pantalla una navegación que no existe.
 */
export function ExploraPorPiedra({ grupos }: { grupos: GrupoPiedra[] }) {
  const [activa, setActiva] = useState(grupos[0]?.piedra ?? "");
  const [visible, setVisible] = useState(true);
  const pista = useRef<HTMLDivElement>(null);
  const [alInicio, setAlInicio] = useState(true);
  const [alFinal, setAlFinal] = useState(false);
  const [desborda, setDesborda] = useState(false);

  const grupo = useMemo(
    () => grupos.find((g) => g.piedra === activa) ?? grupos[0],
    [grupos, activa]
  );

  const revisarBordes = useCallback(() => {
    const el = pista.current;
    if (!el) return;
    // 2px de holgura: el scroll se redondea a subpíxeles y sin margen el
    // botón del extremo nunca llegaría a deshabilitarse.
    setAlInicio(el.scrollLeft <= 2);
    setAlFinal(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
    // Si todas las piedras caben, las flechas sobran
    setDesborda(el.scrollWidth > el.clientWidth + 2);
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

  const cambiar = (piedra: string) => {
    if (piedra === activa) return;
    // Fundido de salida y entrada: el contenido se reemplaza a mitad de
    // camino, con la altura ya reservada por la rejilla.
    setVisible(false);
    window.setTimeout(() => {
      setActiva(piedra);
      setVisible(true);
    }, 300);
  };

  const desplazar = (direccion: 1 | -1) => {
    pista.current?.scrollBy({ left: 200 * direccion, behavior: "smooth" });
  };

  if (!grupo) return null;

  const mostradas = grupo.piezas.slice(0, MAXIMO_EN_REJILLA);
  const hayMas = grupo.piezas.length > MAXIMO_EN_REJILLA;

  return (
    <div className="contenedor">
      <div className="piedras__cabeza">
        <p className="eyebrow">Cada piedra, una intención</p>
        <h2 id="piedras-titulo" className="seccion__titulo">
          Explora por piedra
        </h2>
      </div>

      <div className="piedras__filtros">
        {desborda ? (
          <button
            type="button"
            className="piedras__flecha"
            aria-label="Ver piedras anteriores"
            onClick={() => desplazar(-1)}
            disabled={alInicio}
          >
            <span aria-hidden="true">‹</span>
          </button>
        ) : null}

        <div className="piedras__pista" ref={pista}>
          {grupos.map((g) => {
            const seleccionada = g.piedra === grupo.piedra;
            return (
              <button
                key={g.piedra}
                type="button"
                className={`piedras__pildora${seleccionada ? " es-activa" : ""}`}
                aria-pressed={seleccionada}
                aria-label={`Filtrar por ${g.piedra}`}
                onClick={() => cambiar(g.piedra)}
              >
                <span className="piedras__nombre">{g.piedra}</span>
                <span
                  className="piedras__gema"
                  style={{ ["--gema" as string]: colorDePiedra(g.piedra) }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>

        {desborda ? (
          <button
            type="button"
            className="piedras__flecha"
            aria-label="Ver piedras siguientes"
            onClick={() => desplazar(1)}
            disabled={alFinal}
          >
            <span aria-hidden="true">›</span>
          </button>
        ) : null}
      </div>

      {/* Anuncio discreto del cambio para lectores de pantalla */}
      <p className="solo-lectores" role="status">
        {grupo.piezas.length}{" "}
        {grupo.piezas.length === 1 ? "pieza" : "piezas"} con {grupo.piedra}
      </p>

      <div className={`piedras__contenido${visible ? " es-visible" : ""}`}>
        {grupo.frase ? (
          <p className="piedras__frase">{grupo.frase}</p>
        ) : null}

        {/* Sin la clase .rejilla: su minmax(15rem) fuerza una sola columna
            en móvil y pisa a .piedras__rejilla por orden en la hoja */}
        <div className="piedras__rejilla">
          {mostradas.map((p, i) => (
            <TarjetaPieza key={p.slug} pieza={p} prioridad={i < 2} />
          ))}
        </div>

        {hayMas ? (
          <p className="piedras__pie">
            <Link className="enlace-discreto" href={`/${grupo.slugCategoria}`}>
              Ver todas las piezas con {grupo.piedra}
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
