import Link from "next/link";
import { MARCA, MANTRA, COLECCIONES_WEB, ordenarPorPiedra } from "@/lib/site";
import {
  obtenerPiezasSeguro,
  slugDeColeccion,
  slugDeTipo,
  tiposDePiezaDisponibles,
} from "@/lib/productos";
import { enlaceWhatsAppGeneral } from "@/lib/comercio";
import { Sello, Estrella, IconoWhatsApp } from "@/components/Marca";
import { Hero } from "@/components/Hero";
import {
  CarruselCategorias,
  type CategoriaCarrusel,
} from "@/components/CarruselCategorias";
import {
  ExploraPorPiedra,
  type GrupoPiedra,
} from "@/components/ExploraPorPiedra";
import {
  ExploraPorColeccion,
  type GrupoColeccion,
} from "@/components/ExploraPorColeccion";
import { CarruselArticulos } from "@/components/CarruselArticulos";
import { ARTICULOS } from "@/lib/articulos";
import { Cierre } from "@/components/Estructura";

export const revalidate = 300;

/**
 * Agrupa las piezas por colección para los círculos del home.
 *
 * Toma la colección tal como viene del Excel: si se filtrara contra
 * COLECCIONES_WEB, cada colección nueva quedaría invisible hasta que alguien
 * la registre a mano en site.ts. El nombre publicado se usa cuando existe.
 * Una colección sin ninguna foto no genera círculo.
 */
function agruparPorColeccion(
  piezas: Awaited<ReturnType<typeof obtenerPiezasSeguro>>["piezas"]
): GrupoColeccion[] {
  // Defensa temporal contra datos mal capturados, no una regla de negocio:
  // algunas filas traen el tipo de pieza en la columna "coleccion" ("Topos",
  // "Punto de luz"). Se descartan como colección hasta que se corrija el
  // Excel; la pieza se sigue publicando en su categoría con normalidad.
  //
  // Se comparan las dos formas del tipo —cruda y pluralizada— porque
  // slugDeTipo convierte "Punto de luz" en "puntos-de-luz" y la colección
  // mal capturada llega en singular.
  const tiposConocidos = new Set<string>();
  for (const p of piezas) {
    if (!p.tipoPieza) continue;
    tiposConocidos.add(slugDeTipo(p.tipoPieza));
    tiposConocidos.add(slugDeColeccion(p.tipoPieza));
  }

  const porColeccion = new Map<string, GrupoColeccion>();
  for (const p of piezas) {
    if (!p.coleccion) continue;
    const slug = slugDeColeccion(p.coleccion);
    if (tiposConocidos.has(slug)) continue;
    let grupo = porColeccion.get(slug);
    if (!grupo) {
      grupo = {
        coleccion: COLECCIONES_WEB[slug]?.nombre ?? p.coleccion,
        slug,
        foto: "",
        fotoAlt: "",
        totalPiezas: 0,
      };
      porColeccion.set(slug, grupo);
    }
    grupo.totalPiezas += 1;
    // Portada: la primera destacada con foto; si no, la primera con foto
    if (p.foto && (!grupo.foto || (p.destacada && !grupo.fotoDestacada))) {
      grupo.foto = p.foto;
      grupo.fotoAlt = p.fotoAlt || `${grupo.coleccion} de Sophia Auréa`;
      if (p.destacada) grupo.fotoDestacada = true;
    }
  }
  return [...porColeccion.values()].filter((g) => g.foto);
}

/**
 * Agrupa las piezas por piedra para la sección "Explora por piedra".
 * Una piedra sin piezas no genera grupo, así que su pestaña nunca aparece.
 */
function agruparPorPiedra(
  piezas: Awaited<ReturnType<typeof obtenerPiezasSeguro>>["piezas"]
): GrupoPiedra[] {
  const porPiedra = new Map<string, GrupoPiedra>();
  for (const p of piezas) {
    if (!p.piedra) continue;
    let grupo = porPiedra.get(p.piedra);
    if (!grupo) {
      grupo = {
        piedra: p.piedra,
        // Frase validada de la primera pieza; si está vacía no se muestra
        frase: p.frase ?? "",
        slugCategoria: slugDeTipo(p.tipoPieza),
        piezas: [],
      };
      porPiedra.set(p.piedra, grupo);
    }
    if (!grupo.frase && p.frase) grupo.frase = p.frase;
    grupo.piezas.push(p);
  }
  return [...porPiedra.values()].sort((a, b) => ordenarPorPiedra(a.piedra, b.piedra));
}

export default async function Portada() {
  const { piezas } = await obtenerPiezasSeguro();
  const gruposPiedra = agruparPorPiedra(piezas);
  const gruposColeccion = agruparPorColeccion(piezas);

  // Solo los artículos ya escritos: los que tienen `cuerpo` vacío están en
  // preparación y no se anuncian en el home. Sin foto: las tarjetas quedan en
  // blanco hasta tener fotografía propia.
  const tarjetasArticulos = ARTICULOS.filter((a) => a.cuerpo).map((a) => ({
    slug: a.slug,
    categoria: a.categoria,
    titulo: a.titulo,
  }));

  // Fotos del hero: primero las destacadas; si ninguna tiene foto, cualquiera
  // que la tenga. Tres estados, uno por frase del mantra. El barajado y la
  // rotación ocurren en el cliente.
  const conFoto = piezas.filter((p) => p.foto);
  const destacadasConFoto = conFoto.filter((p) => p.destacada);
  const fotosHero = (destacadasConFoto.length > 0 ? destacadasConFoto : conFoto).slice(0, 3);

  // Una tarjeta por tipo de pieza, con la foto de una destacada de ese tipo
  // (o la primera con foto). Los tipos sin ninguna foto no se muestran.
  const categorias: CategoriaCarrusel[] = tiposDePiezaDisponibles(piezas)
    .map(({ slug, etiqueta }) => {
      const delTipo = conFoto.filter((p) => slugDeTipo(p.tipoPieza) === slug);
      const portada = delTipo.find((p) => p.destacada) ?? delTipo[0];
      if (!portada) return null;
      return {
        slug,
        etiqueta,
        foto: portada.foto,
        fotoAlt: portada.fotoAlt || `${etiqueta} de Sophia Auréa`,
      };
    })
    .filter((c): c is CategoriaCarrusel => c !== null);

  return (
    <>
      {fotosHero.length > 0 ? (
        <Hero
          piezas={fotosHero}
          mantra={MANTRA}
          descripcion="Cada joya es creada para acompañar momentos importantes de la vida."
          firma={MARCA.nombre}
          acciones={
            <>
              <Link className="boton boton--primario" href="#destacadas">Ver las joyas</Link>
              <a className="boton boton--whatsapp" href={enlaceWhatsAppGeneral("portada-hero")} target="_blank" rel="noopener noreferrer">
                <IconoWhatsApp />Escribir por WhatsApp
                <span className="solo-lectores">(se abre en una pestaña nueva)</span>
              </a>
            </>
          }
        />
      ) : (
        <section className="hero" aria-labelledby="hero-titulo">
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
                <a className="boton boton--whatsapp" href={enlaceWhatsAppGeneral("portada-hero")} target="_blank" rel="noopener noreferrer">
                  <IconoWhatsApp />Escribir por WhatsApp
                  <span className="solo-lectores">(se abre en una pestaña nueva)</span>
                </a>
              </div>
            </div>
            <div><Sello /></div>
          </div>
        </section>
      )}

      <div className="franja">
        <ul className="contenedor franja__lista">
          {MARCA.atributos.map((a, i) => (
            <li key={a} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {i > 0 ? (
                <span className="franja__separador" style={{ color: "var(--oro)" }}>
                  <Estrella tamano={10} />
                </span>
              ) : null}
              {a}
            </li>
          ))}
        </ul>
      </div>

      {categorias.length > 0 ? (
        <section className="seccion categorias" id="destacadas" aria-labelledby="destacadas-titulo">
          <CarruselCategorias categorias={categorias} tituloId="destacadas-titulo" />
        </section>
      ) : (
        <section className="seccion" id="destacadas" aria-labelledby="destacadas-titulo">
          <div className="contenedor">
            <div className="seccion__cabeza">
              <p className="eyebrow">Nuestras piezas</p>
              <h2 id="destacadas-titulo" className="seccion__titulo">Lo que amamos ahora</h2>
            </div>
            <p className="aviso">El catálogo aún no está conectado. Configura Microsoft Graph para ver las piezas.</p>
          </div>
        </section>
      )}

      {gruposPiedra.length > 0 ? (
        <section
          className="seccion seccion--velada piedras"
          id="piedras"
          aria-labelledby="piedras-titulo"
        >
          <ExploraPorPiedra grupos={gruposPiedra} />
        </section>
      ) : null}

      {gruposColeccion.length > 0 ? (
        <section
          className="seccion colecciones"
          id="colecciones"
          aria-labelledby="colecciones-titulo"
        >
          <ExploraPorColeccion grupos={gruposColeccion} />
        </section>
      ) : null}

      {/* La sección aparece sola cuando haya al menos un artículo con texto:
          enlazar tarjetas a páginas "en preparación" resta confianza en la
          página que debe generarla. Basta llenar `cuerpo` en articulos.ts. */}
      {tarjetasArticulos.length > 0 ? (
        <section className="seccion articulos" aria-labelledby="articulos-titulo">
          <div className="contenedor articulos__cabeza">
            <div>
              <h2 id="articulos-titulo" className="seccion__titulo articulos__titulo">
                Lo que debes saber
              </h2>
              <p className="prosa">
                Cuidado, símbolos y el oficio detrás de cada joya.
              </p>
            </div>
            <Link className="articulos__ver-todos" href="/mas-alla">
              Ver todos los artículos <span aria-hidden="true">→</span>
            </Link>
          </div>
          <CarruselArticulos articulos={tarjetasArticulos} />
        </section>
      ) : null}

      <Cierre />
    </>
  );
}
