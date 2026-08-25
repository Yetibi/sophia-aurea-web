import Link from "next/link";
import { MARCA, MANTRA, COLECCION_FORTUNA, COLECCIONES_WEB, ordenarPorPiedra } from "@/lib/site";
import { obtenerPiezasSeguro, slugDeColeccion } from "@/lib/productos";
import { enlaceWhatsAppGeneral } from "@/lib/comercio";
import { Sello, Estrella, IconoWhatsApp } from "@/components/Marca";
import { HeroCarrusel } from "@/components/HeroCarrusel";
import { TarjetaPieza } from "@/components/TarjetaPieza";
import { Piedrero, type EntradaPiedra } from "@/components/Piedrero";
import { Cierre } from "@/components/Estructura";

export const revalidate = 300;

function entradasDePiedra(piezas: Awaited<ReturnType<typeof obtenerPiezasSeguro>>["piezas"]): EntradaPiedra[] {
  const porPiedra = new Map<string, EntradaPiedra>();
  for (const p of piezas) {
    if (!p.piedra || !p.frase) continue;
    if (slugDeColeccion(p.coleccion) !== "fortuna") continue;
    if (porPiedra.has(p.piedra)) continue;
    porPiedra.set(p.piedra, { piedra: p.piedra, slug: p.slug, nombre: p.nombre, frase: p.frase, simboliza: p.simboliza });
  }
  return [...porPiedra.values()].sort((a, b) => ordenarPorPiedra(a.piedra, b.piedra));
}

export default async function Portada() {
  const { piezas } = await obtenerPiezasSeguro();
  const marcadas = piezas.filter((p) => p.destacada);
  const destacadas = (marcadas.length > 0 ? marcadas : piezas).slice(0, 4);
  const entradas = entradasDePiedra(piezas);

  // Fotos del hero: primero las destacadas; si ninguna tiene foto, cualquiera
  // que la tenga. El barajado y la rotación ocurren en el cliente.
  const conFoto = piezas.filter((p) => p.foto);
  const destacadasConFoto = conFoto.filter((p) => p.destacada);
  const fotosHero = (destacadasConFoto.length > 0 ? destacadasConFoto : conFoto).slice(0, 5);

  return (
    <>
      <section
        className={`hero${fotosHero.length > 0 ? " hero--con-fondo" : ""}`}
        aria-labelledby="hero-titulo"
      >
        {fotosHero.length > 0 ? <HeroCarrusel piezas={fotosHero} /> : null}
        <div className="contenedor hero__rejilla">
          <div className="hero__texto">
            <p className="eyebrow">{MARCA.ciudad} · {MARCA.tagline}</p>
            <h1 id="hero-titulo" className="hero__titulo">{MANTRA[0]}</h1>
            <p className="hero__mantra">{MANTRA[1]}<br />{MANTRA[2]}</p>
            <p className="prosa" style={{ marginTop: "1rem" }}>
              Cada joya es creada para acompañar momentos importantes de la vida.
            </p>
            <p className="firma hero__firma">{MARCA.nombre}</p>
            <div className="hero__acciones">
              <Link className="boton boton--primario" href="#destacadas">Ver las joyas</Link>
              <a className="boton boton--secundario" href={enlaceWhatsAppGeneral("portada-hero")} target="_blank" rel="noopener noreferrer">
                <IconoWhatsApp />Escribir por WhatsApp
                <span className="solo-lectores">(se abre en una pestaña nueva)</span>
              </a>
            </div>
          </div>
          {fotosHero.length === 0 ? <div><Sello /></div> : null}
        </div>
      </section>

      <div className="franja">
        <ul className="contenedor franja__lista">
          {MARCA.atributos.map((a, i) => (
            <li key={a} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {i > 0 ? <span style={{ color: "var(--oro)" }}><Estrella tamano={10} /></span> : null}
              {a}
            </li>
          ))}
        </ul>
      </div>

      <section className="seccion" id="destacadas" aria-labelledby="destacadas-titulo">
        <div className="contenedor">
          <div className="seccion__cabeza">
            <p className="eyebrow">Piezas destacadas</p>
            <h2 id="destacadas-titulo" className="seccion__titulo">Lo que amamos ahora</h2>
          </div>
          {destacadas.length > 0 ? (
            <div className="rejilla rejilla--coleccion">
              {destacadas.map((p, i) => <TarjetaPieza key={p.slug} pieza={p} prioridad={i < 2} />)}
            </div>
          ) : (
            <p className="aviso">El catálogo aún no está conectado. Configura Microsoft Graph para ver las piezas.</p>
          )}
        </div>
      </section>

      {entradas.length > 0 ? (
        <section className="seccion seccion--velada" id="coleccion" aria-labelledby="coleccion-titulo">
          <div className="contenedor">
            <div className="seccion__cabeza">
              <p className="eyebrow">También puedes descubrir por colección</p>
              <h2 id="coleccion-titulo" className="seccion__titulo">
                Colección {COLECCION_FORTUNA.nombre} — El {COLECCION_FORTUNA.piezaInsignia}
              </h2>
              <p className="prosa" style={{ marginTop: "1rem" }}>{COLECCION_FORTUNA.presentacion}</p>
            </div>
            <Piedrero entradas={entradas} />
          </div>
        </section>
      ) : null}

      <section className="seccion" aria-labelledby="colecciones-titulo">
        <div className="contenedor">
          <div className="seccion__cabeza">
            <p className="eyebrow">Nuestras colecciones</p>
            <h2 id="colecciones-titulo" className="seccion__titulo">Cada colección, un mundo</h2>
          </div>
          <div className="bloques">
            {Object.entries(COLECCIONES_WEB).map(([slug, c]) => (
              <article key={slug}>
                <hr className="bloque__regla" />
                <h3 className="bloque__titulo">{c.nombre}</h3>
                <p className="bloque__texto">
                  {c.presentacion ? c.presentacion.slice(0, 120) + (c.presentacion.length > 120 ? "…" : "") : "Descubre las piezas de esta colección."}
                </p>
                <p style={{ marginTop: "0.75rem" }}>
                  <Link className="enlace-discreto" href={`/colecciones/${slug}`}>Ver la colección {c.nombre}</Link>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Cierre />
    </>
  );
}
