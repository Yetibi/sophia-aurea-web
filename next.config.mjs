/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    // El catálogo se reenvía bajo /catalogo, así que su logo lo optimiza
    // ESTE proyecto. Sin autorizar su subdominio, next/image responde 400 y
    // el logo aparece roto (el catálogo, en cambio, sí carga).
    remotePatterns: [{ protocol: "https", hostname: "catalogo.sophiaaurea.co" }],
  },
  async rewrites() {
    // El catálogo operativo es OTRO proyecto de Vercel y vive en su propio
    // subdominio (catalogo.sophiaaurea.co): este sitio solo reenvía /catalogo
    // hacia allá. Nunca apuntar CATALOGO_EXTERNO_URL al dominio raíz — cuando
    // sophiaaurea.co sirva este proyecto, el reenvío se llamaría a sí mismo.
    const externo = process.env.CATALOGO_EXTERNO_URL;
    if (!externo) return [];
    return [
      { source: "/catalogo", destination: `${externo}/catalogo` },
      { source: "/catalogo/:ruta*", destination: `${externo}/catalogo/:ruta*` },
      // El catálogo pide sus datos y fotos a rutas absolutas: sin reenviarlas
      // también, la página carga pero se queda esperando su propio API (404).
      // No chocan con las de este sitio, que usa /api/foto y /api/revalidar.
      { source: "/api/productos", destination: `${externo}/api/productos` },
      { source: "/api/imagen/:ruta*", destination: `${externo}/api/imagen/:ruta*` },
    ];
  },
};
export default nextConfig;
