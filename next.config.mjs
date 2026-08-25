/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  async rewrites() {
    // Si el catálogo en producción vive en OTRO proyecto de Vercel, define
    // CATALOGO_EXTERNO_URL (p. ej. https://catalogo-sophia.vercel.app) y este
    // sitio reenvía /catalogo hacia allá sin tocarlo. Si el catálogo es la
    // página local de este mismo proyecto, deja la variable vacía.
    const externo = process.env.CATALOGO_EXTERNO_URL;
    if (!externo) return [];
    return [
      { source: "/catalogo", destination: `${externo}/catalogo` },
      { source: "/catalogo/:ruta*", destination: `${externo}/catalogo/:ruta*` },
    ];
  },
};
export default nextConfig;
