import Link from "next/link";
import Image from "next/image";
import type { Pieza } from "@/lib/tipos";
import { formatearPrecio, etiquetaDisponibilidad, srcDeFoto } from "@/lib/tipos";
import { colorDePiedra } from "@/lib/site";
import { MOSTRAR_PRECIOS } from "@/lib/comercio";
import { Estrella } from "./Marca";

/** Foto de la pieza o placeholder de marca (nunca un hueco roto). */
export function FotoPieza({
  pieza,
  prioridad = false,
  sizes = "(max-width: 48rem) 50vw, 22rem",
}: {
  pieza: Pieza;
  prioridad?: boolean;
  sizes?: string;
}) {
  const gema = colorDePiedra(pieza.piedra);
  if (!pieza.foto) {
    return (
      <span className="sinfoto" style={{ ["--gema" as string]: gema }}>
        <Estrella tamano={22} />
        <span className="sinfoto__gema" aria-hidden="true" />
        <small>Fotografía en camino</small>
      </span>
    );
  }
  const src = srcDeFoto(pieza.foto);
  if (!src) return null;
  return (
    <Image
      className="pieza__foto"
      src={src}
      alt={pieza.fotoAlt}
      fill
      sizes={sizes}
      priority={prioridad}
      unoptimized={/^https?:\/\//i.test(pieza.foto)}
    />
  );
}

/** Tarjeta de pieza usada en home, categorías y "piezas hermanas". */
export function TarjetaPieza({ pieza, prioridad = false }: { pieza: Pieza; prioridad?: boolean }) {
  const gema = colorDePiedra(pieza.piedra);
  const etiqueta = etiquetaDisponibilidad(pieza.disponibilidad);
  const claseEtiqueta = pieza.disponibilidad === "limitada" ? "pieza__etiqueta--limitada" : "";

  return (
    <Link href={`/joyas/${pieza.slug}`} className="pieza" style={{ textDecoration: "none" }}>
      <span className="pieza__marco">
        <FotoPieza pieza={pieza} prioridad={prioridad} />
        {etiqueta ? (
          <span className={`pieza__etiqueta ${claseEtiqueta}`}>{etiqueta}</span>
        ) : null}
      </span>
      <span className="pieza__cuerpo">
        <span className="pieza__meta">
          <span
            className="pieza__gema"
            style={{ ["--gema" as string]: gema }}
            aria-hidden="true"
          />
          {[pieza.piedra, pieza.coleccion].filter(Boolean).join(" · ")}
        </span>
        <span
          className="pieza__nombre"
          style={{ display: "block", fontFamily: "var(--display)" }}
        >
          {pieza.nombre}
        </span>
        {pieza.frase ? <span className="pieza__frase">{pieza.frase}</span> : null}
        {MOSTRAR_PRECIOS && pieza.precioCop ? (
          <span className="pieza__precio">{formatearPrecio(pieza.precioCop)}</span>
        ) : null}
      </span>
    </Link>
  );
}
