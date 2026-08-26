import type { Metadata, Viewport } from "next";
import Script from "next/script";
// SANDBOX: fuentes desactivadas solo para verificar la compilación
import { MARCA, MANTRA } from "@/lib/site";
import { Cabecera, Pie } from "@/components/Estructura";
import { jsonLdOrganizacion, serializarJsonLd } from "@/lib/seo";
import "./globals.css";

const display={variable:""},utilidad={variable:""},firma={variable:""};

export const metadata: Metadata = {
  metadataBase: new URL(MARCA.url),
  title: {
    default: `${MARCA.nombre} — ${MARCA.tagline}`,
    template: `%s — ${MARCA.nombre}`,
  },
  description: `${MANTRA.join(" ")} Joyería en oro Ley 750 y piedras naturales, hecha en ${MARCA.ciudad}.`,
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: MARCA.nombre,
    title: `${MARCA.nombre} — ${MARCA.tagline}`,
    description: MANTRA.join(" "),
    url: MARCA.url,
    // Cuadrada: es como se comparte el sitio por WhatsApp, el canal de venta
    // 1200×630: la proporción que WhatsApp y las redes recortan sin cortar
    images: [{ url: "/marca/og-imagen.png", width: 1200, height: 630, alt: MARCA.nombre }],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/icon-192.png",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FDFBF7",
};

const GA = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${display.variable} ${utilidad.variable} ${firma.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLdOrganizacion()) }}
        />
        <a className="saltar" href="#contenido">
          Saltar al contenido
        </a>
        <Cabecera />
        <main id="contenido">{children}</main>
        <Pie />

        {GA ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA}`}
              strategy="afterInteractive"
            />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config','${GA}',{anonymize_ip:true});`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
