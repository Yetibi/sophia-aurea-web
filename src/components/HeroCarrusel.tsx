"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Pieza } from "@/lib/tipos";
import { srcDeFoto } from "@/lib/tipos";

const INTERVALO_MS = 5000;

/**
 * Fotos rotativas del hero.
 *
 * Componente de cliente: recibe las piezas ya filtradas desde el servidor
 * (productos.ts es server-only y no puede importarse aquí).
 *
 * El orden se baraja en el cliente después de montar, no durante el render:
 * barajar en render daría un HTML de servidor distinto al del cliente y React
 * marcaría error de hidratación.
 */
export function HeroCarrusel({ piezas }: { piezas: Pieza[] }) {
  const [orden, setOrden] = useState<number[]>(() => piezas.map((_, i) => i));
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [animar, setAnimar] = useState(true);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const indices = piezas.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setOrden(indices);
    setActivo(0);
  }, [piezas]);

  // Respeta la preferencia del sistema, y también si el usuario la cambia en vivo.
  useEffect(() => {
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => setAnimar(!consulta.matches);
    aplicar();
    consulta.addEventListener("change", aplicar);
    return () => consulta.removeEventListener("change", aplicar);
  }, []);

  useEffect(() => {
    if (!animar || pausado || orden.length < 2) return;
    const id = window.setInterval(
      () => setActivo((i) => (i + 1) % orden.length),
      INTERVALO_MS
    );
    return () => window.clearInterval(id);
  }, [animar, pausado, orden.length]);

  // El foco dentro del carrusel pausa: quien navega con teclado necesita que
  // la imagen no cambie bajo sus pies mientras recorre los puntos.
  const alEnfocar = () => setPausado(true);
  const alDesenfocar = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!contenedor.current?.contains(e.relatedTarget as Node | null)) setPausado(false);
  };

  const visibles = orden.map((i) => piezas[i]).filter(Boolean);
  if (visibles.length === 0) return null;

  return (
    <div
      ref={contenedor}
      className="hero-carrusel"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={alEnfocar}
      onBlur={alDesenfocar}
    >
      {/* Fondo decorativo: el texto del hero va encima. Las fotos no se
          anuncian a lectores de pantalla — las piezas se presentan con su
          nombre y precio más abajo, en "Piezas destacadas". */}
      <div className="hero-carrusel__fondo" aria-hidden="true">
        {visibles.map((pieza, i) => {
          const src = srcDeFoto(pieza.foto);
          if (!src) return null;
          return (
            <Image
              key={pieza.slug}
              className={`hero-carrusel__foto${i === activo ? " es-activa" : ""}`}
              src={src}
              alt=""
              fill
              sizes="100vw"
              priority={i === 0}
              unoptimized={/^https?:\/\//i.test(pieza.foto)}
            />
          );
        })}
        {/* Velo marfil: sin él, la tinta sobre foto no llega a 4.5:1 */}
        <span className="hero-carrusel__velo" />
      </div>

      {animar && visibles.length > 1 ? (
        <div className="hero-carrusel__puntos">
          {visibles.map((pieza, i) => (
            <button
              key={pieza.slug}
              type="button"
              className={`hero-carrusel__punto${i === activo ? " es-activo" : ""}`}
              aria-label={`Ver imagen ${i + 1} de ${visibles.length}`}
              aria-current={i === activo ? "true" : undefined}
              onClick={() => setActivo(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
