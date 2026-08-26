"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Menú de la cabecera en móvil.
 *
 * En pantallas anchas el CSS oculta el botón y muestra los enlaces en línea;
 * los mismos enlaces sirven a ambos casos, así que se reciben por props y no
 * se duplican en el marcado.
 */
export function MenuMovil({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const idPanel = useId();

  useEffect(() => {
    if (!abierto) return;

    // El foco entra al panel: quien navega con teclado sigue donde abrió.
    panel.current?.querySelector("a")?.focus();

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    const alTocarFuera = (e: MouseEvent) => {
      const destino = e.target as Node;
      if (!panel.current?.contains(destino) && !boton.current?.contains(destino)) {
        setAbierto(false);
      }
    };

    document.addEventListener("keydown", alPulsar);
    document.addEventListener("mousedown", alTocarFuera);
    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.removeEventListener("mousedown", alTocarFuera);
    };
  }, [abierto]);

  return (
    <>
      <button
        ref={boton}
        type="button"
        className="cabecera__boton-menu"
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => {
          setAbierto((v) => !v);
        }}
      >
        <span aria-hidden="true">{abierto ? "✕" : "☰"}</span>
      </button>

      <div
        ref={panel}
        id={idPanel}
        className={`cabecera__panel${abierto ? " es-abierto" : ""}`}
      >
        <nav aria-label="Principal" className="cabecera__nav">
          {children}
        </nav>
      </div>
    </>
  );
}
