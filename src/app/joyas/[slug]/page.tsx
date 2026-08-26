import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  obtenerPiezasSeguro,
  piezasDeColeccion,
  slugDeColeccion,
} from "@/lib/productos";
import type { Pieza } from "@/lib/tipos";
import { MARCA, colorDePiedra } from "@/lib/site";
import { canalWhatsApp, MOSTRAR_PRECIOS } from "@/lib/comercio";
import { formatearPrecio, etiquetaDisponibilidad, srcDeFoto } from "@/lib/tipos";
import { jsonLdPieza, jsonLdMiga, serializarJsonLd } from "@/lib/seo";
import { Estrella, IconoWhatsApp } from "@/components/Marca";
import { TarjetaPieza } from "@/components/TarjetaPieza";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { piezas } = await obtenerPiezasSeguro();
  return piezas.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { piezas } = await obtenerPiezasSeguro();
  const pieza = piezas.find((p) => p.slug === slug);
  if (!pieza) return {};
  const titulo = tituloDePieza(pieza);
  return {
    title: titulo,
    description: pieza.frase
      ? `${pieza.frase} ${pieza.tipoPieza} en ${pieza.material} de ${MARCA.nombre}.`
      : `${titulo}, de ${MARCA.nombre} — ${MARCA.tagline}.`,
    alternates: { canonical: `/joyas/${pieza.slug}` },
    openGraph: { title: titulo, description: pieza.frase || MARCA.tagline },
  };
}

/** H1 = title: nombre + tipo + piedra + material (mapa de keywords, Fase 2). */
function tituloDePieza(p: Pieza): string {
  const partes = [
    p.nombre,
    [p.tipoPieza, p.figura && `de ${p.figura.toLowerCase()}`, p.piedra && `con ${p.piedra.toLowerCase()}`]
      .filter(Boolean)
      .join(" "),
    p.material.toLowerCase().startsWith("oro") ? `en ${p.material.toLowerCase()}` : p.material,
  ].filter(Boolean);
  return partes.join(" — ");
}

function FotoPrincipal({ pieza }: { pieza: Pieza }) {
  const gema = colorDePiedra(pieza.piedra);
  if (!pieza.foto) {
    // Placeholder como activo de marca (regla 5 del sistema).
    return (
      <div className="sinfoto" style={{ ["--gema" as string]: gema }}>
        <Estrella tamano={26} />
        <span className="sinfoto__gema" aria-hidden="true" />
        <small>Fotografía en camino</small>
      </div>
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
      sizes="(max-width: 62rem) 100vw, 40rem"
      priority
      unoptimized={/^https?:\/\//i.test(pieza.foto)}
    />
  );
}

export default async function PaginaJoya({ params }: Props) {
  const { slug } = await params;
  const { piezas } = await obtenerPiezasSeguro();
  const pieza = piezas.find((p) => p.slug === slug);
  if (!pieza) notFound();

  const slugColeccion = slugDeColeccion(pieza.coleccion);
  const hermanas = piezasDeColeccion(piezas, slugColeccion)
    .filter((p) => p.slug !== pieza.slug)
    .slice(0, 3);

  const urlPieza = `${MARCA.url}/joyas/${pieza.slug}`;
  const compra = canalWhatsApp.iniciarCompra({ pieza, cantidad: 1, origen: "detalle" });
  const enlaceCompra = compra.tipo === "redireccion" ? compra.url : null;

  const filas: [string, string][] = (
    [
      ["Colección", pieza.coleccion],
      ["Figura", pieza.figura],
      ["Tipo de pieza", pieza.tipoPieza],
      ["Piedra", pieza.piedra],
      ["Color de la piedra", pieza.colorPiedra],
      ["Forma de la piedra", pieza.formaPiedra],
      ["Tamaño de la piedra", pieza.tamanoPiedraMm],
      ["Tamaño", pieza.tamano],
      ["Dimensiones", pieza.dimensiones],
      ["Material", pieza.material],
    ] as [string, string][]
  ).filter(([, v]) => Boolean(v));

  const jsonLd = [
    jsonLdPieza(
      pieza,
      urlPieza,
      pieza.foto
        ? (srcDeFoto(pieza.foto) ?? "").startsWith("http")
          ? srcDeFoto(pieza.foto)!
          : `${MARCA.url}${srcDeFoto(pieza.foto)}`
        : undefined,
    ),
    jsonLdMiga([
      { nombre: "Inicio", url: MARCA.url },
      { nombre: `Colección ${pieza.coleccion}`, url: `${MARCA.url}/colecciones/${slugColeccion}` },
      { nombre: pieza.nombre, url: urlPieza },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }}
      />

      <article className="seccion con-cta-fija">
        <div className="contenedor">
          <nav aria-label="Miga de pan">
            <ol className="miga" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li>
                <Link href="/">Inicio</Link>
              </li>
              <li>
                <Link href={`/colecciones/${slugColeccion}`}>{pieza.coleccion}</Link>
              </li>
              <li aria-current="page">{pieza.nombre}</li>
            </ol>
          </nav>

          <div className="pieza-detalle">
            <div className="pieza-detalle__foto">
              <div className="pieza-detalle__marco">
                <FotoPrincipal pieza={pieza} />
              </div>
            </div>

            <div>
              <p className="eyebrow" style={{ marginBottom: 0 }}>
                {[`Colección ${pieza.coleccion}`, pieza.piedra].filter(Boolean).join(" · ")}
              </p>
              <h1 className="detalle__titulo">{tituloDePieza(pieza)}</h1>

              {pieza.frase ? <p className="detalle__frase">{pieza.frase}</p> : null}

              {MOSTRAR_PRECIOS && pieza.precioCop ? (
                <p className="detalle__precio">{formatearPrecio(pieza.precioCop)}</p>
              ) : null}

              {enlaceCompra && pieza.disponible ? (
                <p style={{ margin: "0 0 1.5rem" }}>
                  <a
                    className="boton boton--whatsapp"
                    href={enlaceCompra}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconoWhatsApp />
                    Me interesa esta pieza
                    <span className="solo-lectores">(se abre en una pestaña nueva)</span>
                  </a>
                </p>
              ) : null}

              {pieza.copyLargo ? <p className="copy-largo">{pieza.copyLargo}</p> : null}

              {pieza.simboliza ? (
                <>
                  <h2 className="eyebrow" style={{ marginTop: "1.8rem" }}>
                    Simboliza
                  </h2>
                  <p className="bloque__texto">{pieza.simboliza}</p>
                </>
              ) : null}

              <h2 className="solo-lectores">Ficha técnica</h2>
              <dl className="ficha">
                {filas.map(([clave, valor]) => (
                  <div className="ficha__fila" key={clave}>
                    <dt className="ficha__clave">{clave}</dt>
                    <dd className="ficha__valor" style={{ margin: 0 }}>
                      {valor}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="bloque__texto">
                Cada joya llega con su paño limpiador de microfibra y su certificado de
                autenticidad.
              </p>

              {pieza.mensaje ? <p className="mensaje" style={{ marginTop: "1.2rem" }}>{pieza.mensaje}</p> : null}

              <p style={{ marginTop: "1rem" }}>
                <Link className="enlace-discreto" href="/catalogo">
                  Ver disponibilidad en el catálogo
                </Link>
              </p>
            </div>
          </div>

          {hermanas.length > 0 ? (
            <section aria-labelledby="hermanas-titulo" style={{ marginTop: "var(--e5)" }}>
              <h2 id="hermanas-titulo" className="seccion__titulo" style={{ fontSize: "var(--t-lg)" }}>
                Otras piezas de la colección {pieza.coleccion}
              </h2>
              <div className="rejilla rejilla--coleccion" style={{ marginTop: "var(--e3)" }}>
                {hermanas.map((h) => (
                  <TarjetaPieza key={h.slug} pieza={h} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>

      {enlaceCompra && pieza.disponible ? (
        <div className="cta-fija">
          <a className="boton boton--whatsapp" href={enlaceCompra} target="_blank" rel="noopener noreferrer">
            <IconoWhatsApp />
            Me interesa esta pieza
            <span className="solo-lectores">(se abre en una pestaña nueva)</span>
          </a>
        </div>
      ) : null}
    </>
  );
}
