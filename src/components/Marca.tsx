import Link from "next/link";
import Image from "next/image";
import { MARCA } from "@/lib/site";

/**
 * Firma de marca: isotipo oficial + nombre y bajada.
 * El isotipo es el archivo del kit de marca (01-marca/logo/exportados), no un
 * redibujo: una aproximación degradaría la identidad. Va aria-hidden porque el
 * nombre ya se lee en texto al lado — anunciarlo dos veces estorba al lector.
 */
export function Wordmark({ comoEnlace = true }: { comoEnlace?: boolean }) {
  // lockup-completo-fondo-marfil del kit: el mismo logo que usa el catálogo,
  // para que ambos productos se vean iguales.
  const contenido = (
    <Image
      className="marca__lockup"
      src="/marca/lockup-completo-fondo-marfil.png"
      alt=""
      aria-hidden="true"
      width={2000}
      height={2000}
      priority
    />
  );

  if (!comoEnlace) return <span className="marca">{contenido}</span>;

  return (
    <Link href="/" className="marca">
      <span className="solo-lectores">{MARCA.nombre} — inicio</span>
      <span aria-hidden="true" className="marca__contenido">
        {contenido}
      </span>
    </Link>
  );
}

/** Estrella de ocho puntas — ornamento heredado del sistema visual. */
export function Estrella({ tamano = 16 }: { tamano?: number }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 0l1.9 8.1L22 10l-8.1 1.9L12 20l-1.9-8.1L2 10l8.1-1.9L12 0z" />
      <path d="M12 6.5l.7 3 3 .8-3 .7-.7 3-.7-3-3-.7 3-.8.7-3z" opacity=".5" />
    </svg>
  );
}

/**
 * Logotipo completo de la marca para el hero de portada: la "A"-elefante con
 * loto y estrella sobre el wordmark. Es el archivo oficial del kit
 * (01-principal/lockup-completo), en su versión transparente porque el fondo
 * del sitio ya es marfil — la regla de marca es dorado sobre marfil.
 * Decorativo: el nombre de la marca ya está en el H1 y la cabecera.
 */
export function Lockup() {
  return (
    <Image
      className="lockup"
      src="/marca/lockup-completo.png"
      alt=""
      aria-hidden="true"
      width={688}
      height={796}
      priority
      sizes="(min-width: 62rem) 300px, 46vw"
    />
  );
}

/**
 * Sello circular ornamental dibujado. Se conserva por si se necesita un
 * ornamento tipográfico donde no cabe el logotipo. Decorativo: aria-hidden.
 */
export function Sello() {
  return (
    <svg
      className="sello"
      viewBox="0 0 220 220"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="110" cy="110" r="106" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="110" cy="110" r="96" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="110" cy="110" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <g fill="currentColor">
        <path d="M110 14l3.2 13.6L127 31l-13.8 3.4L110 48l-3.2-13.6L93 31l13.8-3.4L110 14z" />
        <path d="M110 172l2.2 9.4L122 184l-9.8 2.4L110 196l-2.2-9.6L98 184l9.8-2.6L110 172z" />
        <path d="M28 106l1.8 7.4L37 115l-7.2 1.8L28 124l-1.8-7.2L19 115l7.2-1.6L28 106z" />
        <path d="M192 106l1.8 7.4L201 115l-7.2 1.8L192 124l-1.8-7.2L183 115l7.2-1.6L192 106z" />
      </g>
      <text
        x="110"
        y="104"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontFamily: "var(--display)" }}
        fontSize="26"
        letterSpacing="7"
      >
        SOPHIA
      </text>
      <text
        x="110"
        y="134"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontFamily: "var(--display)" }}
        fontSize="26"
        letterSpacing="7"
      >
        AURÉA
      </text>
      <line x1="70" y1="146" x2="150" y2="146" stroke="currentColor" strokeWidth="0.75" />
      <text
        x="110"
        y="160"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontFamily: "var(--utilidad)" }}
        fontSize="7.5"
        letterSpacing="4"
      >
        ORO LEY 750
      </text>
    </svg>
  );
}

/** Ícono de WhatsApp. Decorativo: el botón siempre lleva texto visible. */
export function IconoWhatsApp({ tamano = 18 }: { tamano?: number }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.19.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.03 1.02-1.03 2.48s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 012.89 6.99c0 5.45-4.43 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.69 1.45c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42z" />
    </svg>
  );
}
