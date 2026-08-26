"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Pieza } from "@/lib/tipos";
import { srcDeFoto } from "@/lib/tipos";

const CICLO_MS = 5500;

/**
 * Hero editorial con imagen y frase rotativas, sincronizadas.
 *
 * Componente de cliente: recibe las piezas ya filtradas desde el servidor
 * (productos.ts es server-only).
 *
 * Las tres frases del mantra están SIEMPRE en el DOM, dentro de un único
 * <h1>: la rotación es puramente visual. Así Google indexa el mantra
 * completo y un lector de pantalla lo lee entero una vez, sin aria-live
 * anunciando cambios cada 5 segundos.
 */
export function Hero({
  piezas,
  mantra,
  descripcion,
  firma,
  acciones,
}: {
  piezas: Pieza[];
  mantra: readonly string[];
  descripcion: string;
  firma: string;
  acciones: React.ReactNode;
}) {
  const [orden, setOrden] = useState<number[]>(() => piezas.map((_, i) => i));
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [animar, setAnimar] = useState(true);
  const contenedor = useRef<HTMLDivElement>(null);

  // El barajado ocurre tras montar: hacerlo en render daría un HTML de
  // servidor distinto al del cliente y React marcaría error de hidratación.
  useEffect(() => {
    const indices = piezas.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setOrden(indices);
    setActivo(0);
  }, [piezas]);

  useEffect(() => {
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => setAnimar(!consulta.matches);
    aplicar();
    consulta.addEventListener("change", aplicar);
    return () => consulta.removeEventListener("change", aplicar);
  }, []);

  const estados = Math.min(mantra.length, Math.max(orden.length, 1));

  useEffect(() => {
    if (!animar || pausado || estados < 2) return;
    const id = window.setInterval(() => setActivo((i) => (i + 1) % estados), CICLO_MS);
    return () => window.clearInterval(id);
  }, [animar, pausado, estados]);

  const alDesenfocar = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!contenedor.current?.contains(e.relatedTarget as Node | null)) setPausado(false);
  };

  const fotos = orden.map((i) => piezas[i]).filter(Boolean).slice(0, estados);
  const avanzar = () => setActivo((i) => (i + 1) % estados);

  return (
    <section
      className="hero-editorial"
      aria-labelledby="hero-titulo"
      ref={contenedor}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={alDesenfocar}
    >
      {/* Clic en la imagen avanza. Es un atajo redundante: los indicadores de
          abajo hacen lo mismo y sí son accesibles por teclado. */}
      <div
        className="hero-editorial__fondo"
        aria-hidden="true"
        onClick={animar ? avanzar : undefined}
      >
        {fotos.map((pieza, i) => {
          const src = srcDeFoto(pieza.foto);
          if (!src) return null;
          return (
            <Image
              key={pieza.slug}
              className={`hero-editorial__foto${i === activo ? " es-activa" : ""}${
                animar ? " con-movimiento" : ""
              }`}
              src={src}
              alt={pieza.fotoAlt || pieza.nombre}
              fill
              sizes="100vw"
              priority={i === 0}
              unoptimized={/^https?:\/\//i.test(pieza.foto)}
            />
          );
        })}
        <span className="hero-editorial__velo" />
      </div>

      <div className="contenedor hero-editorial__cuerpo">
        {/* Un solo H1 con el mantra completo: las frases se apilan y solo
            cambia su opacidad. */}
        <h1 id="hero-titulo" className="hero-editorial__titulo">
          {mantra.map((frase, i) => (
            <span
              key={frase}
              className={`hero-editorial__frase${
                !animar || i === activo ? " es-activa" : ""
              }${animar ? " rota" : ""}`}
            >
              {frase}
            </span>
          ))}
        </h1>

        <p className="hero-editorial__descripcion">{descripcion}</p>
        <p className="firma hero-editorial__firma">{firma}</p>
        <div className="hero-editorial__acciones">{acciones}</div>

        {animar && estados > 1 ? (
          <div className="hero-editorial__indicadores">
            {Array.from({ length: estados }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`hero-editorial__indicador${i === activo ? " es-activo" : ""}`}
                aria-label={`Ver ${i + 1} de ${estados}`}
                aria-current={i === activo ? "true" : undefined}
                onClick={() => setActivo(i)}
              >
                <span
                  className="hero-editorial__barra"
                  style={
                    i === activo && !pausado
                      ? { animationDuration: `${CICLO_MS}ms` }
                      : undefined
                  }
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
