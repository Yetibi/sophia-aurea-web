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

/** Rejilla de una categoría (p. ej. Dijes) con filtros por piedra y colección. */
export function CategoriaCliente({ piezas }: { piezas: Pieza[] }) {
  const [piedra, setPiedra] = useState(TODAS);
  const [coleccion, setColeccion] = useState(TODAS);

  const piedras = useMemo(
    () => [...new Set(piezas.map((p) => p.piedra).filter(Boolean))].sort(ordenarPorPiedra),
    [piezas],
  );
  const colecciones = useMemo(
    () =>
      [...new Set(piezas.map((p) => p.coleccion).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [piezas],
  );

  const filtradas = useMemo(
    () =>
      piezas.filter(
        (p) =>
          (piedra === TODAS || p.piedra === piedra) &&
          (coleccion === TODAS || p.coleccion === coleccion),
      ),
    [piezas, piedra, coleccion],
  );

  return (
    <>
      <div className="filtros">
        <GrupoChips leyenda="Piedra" opciones={piedras} valor={piedra} onCambio={setPiedra} />
        <GrupoChips
          leyenda="Colección"
          opciones={colecciones}
          valor={coleccion}
          onCambio={setColeccion}
        />
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
                setColeccion(TODAS);
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
