"use client";

import { useMemo, useState } from "react";
import type { Pieza } from "@/lib/tipos";
import { ordenarPorPiedra } from "@/lib/site";
import { TarjetaPieza } from "./TarjetaPieza";

const TODAS = "todas";

function GrupoChips({
  leyenda,
  opciones,
  valor,
  onCambio,
}: {
  leyenda: string;
  opciones: string[];
  valor: string;
  onCambio: (v: string) => void;
}) {
  if (opciones.length < 2) return null;
  return (
    <fieldset className="filtros__grupo">
      <legend className="filtros__leyenda">{leyenda}</legend>
      <div className="filtros__opciones">
        {[TODAS, ...opciones].map((o) => (
          <button
            key={o}
            type="button"
            className="chip"
            aria-pressed={valor === o}
            onClick={() => onCambio(o)}
          >
            {o === TODAS ? "Todas" : o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Rejilla de una categoría (p. ej. Dijes) con filtros por piedra y figura.
 *
 * No se filtra por colección: dentro de un mismo tipo de pieza la colección
 * aporta poco y duplica la navegación que ya existe en el home. La figura sí
 * distingue (elefante, tortuga, caballo de mar…), y el grupo se oculta solo
 * cuando la categoría tiene una única figura, como Topos o Puntos de luz.
 */
export function CategoriaCliente({ piezas }: { piezas: Pieza[] }) {
  const [piedra, setPiedra] = useState(TODAS);
  const [figura, setFigura] = useState(TODAS);

  const piedras = useMemo(
    () => [...new Set(piezas.map((p) => p.piedra).filter(Boolean))].sort(ordenarPorPiedra),
    [piezas],
  );
  const figuras = useMemo(
    () =>
      [...new Set(piezas.map((p) => p.figura).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [piezas],
  );

  const filtradas = useMemo(
    () =>
      piezas.filter(
        (p) =>
          (piedra === TODAS || p.piedra === piedra) &&
          (figura === TODAS || p.figura === figura),
      ),
    [piezas, piedra, figura],
  );

  return (
    <>
      <div className="filtros">
        <GrupoChips leyenda="Piedra" opciones={piedras} valor={piedra} onCambio={setPiedra} />
        <GrupoChips leyenda="Figura" opciones={figuras} valor={figura} onCambio={setFigura} />
      </div>

      <p className="conteo" role="status">
        {filtradas.length === 1 ? "1 pieza" : `${filtradas.length} piezas`}
      </p>

      <div className="rejilla">
        {filtradas.map((p, i) => (
          <TarjetaPieza key={p.slug} pieza={p} prioridad={i < 4} />
        ))}
        {filtradas.length === 0 ? (
          <p className="vacio">
            Ninguna pieza coincide con esos filtros.{" "}
            <button
              type="button"
              className="chip"
              onClick={() => {
                setPiedra(TODAS);
                setFigura(TODAS);
              }}
            >
              Ver todas
            </button>
          </p>
        ) : null}
      </div>
    </>
  );
}
