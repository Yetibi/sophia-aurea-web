/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
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
    ];
  },
};
export default nextConfig;
