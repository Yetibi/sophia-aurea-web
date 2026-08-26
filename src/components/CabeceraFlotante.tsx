"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Alterna la cabecera entre flotar sobre el hero y su fondo sólido.
 *
 * La cabecera se arma en el servidor (lee el catálogo para el menú), así que
 * la parte con estado vive aquí: este componente solo aporta el <header> y
 * observa el hero. Si la página no tiene hero, no observa nada y la cabecera
 * queda sólida desde el inicio — que es lo correcto en categorías, pieza y
 * políticas.
 */
export function CabeceraFlotante({ children }: { children: React.ReactNode }) {
  const [sobreHero, setSobreHero] = useState(false);
  const cabecera = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = document.querySelector(".hero-editorial");
    if (!hero) return;

    // Arranca flotando: en el primer render la página está arriba del todo.
    setSobreHero(true);

    const alto = cabecera.current?.offsetHeight ?? 0;
    const observador = new IntersectionObserver(
      ([entrada]) => setSobreHero(entrada.isIntersecting),
      // El margen recorta la zona observada al alto de la cabecera: deja de
      // flotar justo cuando el hero termina de pasar por debajo de ella.
      { rootMargin: `-${alto}px 0px 0px 0px`, threshold: 0 }
    );
    observador.observe(hero);
    return () => observador.disconnect();
  }, []);

  return (
    <header
      ref={cabecera}
      className={`cabecera${sobreHero ? " cabecera--sobre-hero" : ""}`}
    >
      {children}
    </header>
  );
}
