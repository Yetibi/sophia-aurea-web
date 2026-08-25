import Link from "next/link";
import { MARCA } from "@/lib/site";
import { enlaceWhatsAppGeneral } from "@/lib/comercio";
import { obtenerPiezasSeguro, tiposDePiezaDisponibles } from "@/lib/productos";
import { Wordmark, IconoWhatsApp, Estrella } from "./Marca";

/**
 * Cabecera con navegación por TIPO DE PIEZA, generada desde el catálogo:
 * si solo hay dijes, solo aparece "Dijes"; al cargar aretes, aparecen solos.
 * Cero mantenimiento manual del menú.
 */
export async function Cabecera() {
  const { piezas } = await obtenerPiezasSeguro();
  const tipos = tiposDePiezaDisponibles(piezas);

  return (
    <header className="cabecera">
      <div className="contenedor cabecera__fila">
        <Wordmark />
        <nav aria-label="Principal" className="cabecera__nav">
          {tipos.map((t) => (
            <Link key={t.slug} href={`/${t.slug}`} className="cabecera__enlace">
              {t.etiqueta}
            </Link>
          ))}
          <Link href="/catalogo" className="cabecera__enlace">
            Disponibilidad
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Cierre() {
  return (
    <section className="cierre sobre-tinta" aria-labelledby="cierre-titulo">
      <div className="contenedor">
        <p style={{ color: "var(--oro)", display: "flex", justifyContent: "center" }}>
          <Estrella tamano={20} />
        </p>
        <h2 id="cierre-titulo" className="cierre__titulo">
          ¿Buscas una pieza para alguien, o para ti?
        </h2>
        <p className="cierre__texto">
          Cuéntanos el momento que quieres acompañar y te ayudamos a elegir la piedra.
        </p>
        <a
          className="boton boton--primario"
          href={enlaceWhatsAppGeneral("cierre")}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconoWhatsApp />
          Escribir por WhatsApp
          <span className="solo-lectores">(se abre en una pestaña nueva)</span>
        </a>
      </div>
    </section>
  );
}

export function Pie() {
  return (
    <footer className="pie">
      <div className="contenedor pie__fila">
        <Wordmark comoEnlace={false} />
        <p className="pie__texto">
          {MARCA.atributos.join(" · ")}
          <br />
          {MARCA.ciudad}
          <br />
          <a
            className="pie__enlace"
            href={MARCA.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver la marca en Instagram, @{MARCA.instagram}
          </a>
        </p>
        <p className="pie__texto">
          <Link className="pie__enlace" href="/catalogo">
            Ver disponibilidad (catálogo)
          </Link>
          <br />
          <Link className="pie__enlace" href="/politicas">
            Políticas y tratamiento de datos
          </Link>
          <br />
          <a
            className="pie__enlace"
            href="https://sedeelectronica.sic.gov.co/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Superintendencia de Industria y Comercio
          </a>
          <br />
          <span style={{ color: "var(--oro-texto)" }}>
            © {new Date().getFullYear()} {MARCA.nombre}
          </span>
        </p>
      </div>
    </footer>
  );
}
