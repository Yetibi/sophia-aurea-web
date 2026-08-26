/**
 * Artículos de "Más allá de la pieza".
 *
 * PROVISIONALES: los cuatro títulos de abajo son marcadores para que la
 * sección tenga forma. Los textos definitivos —titulares incluidos— los
 * escribe la fundadora; no se redactan aquí ni se "mejoran".
 *
 * Mientras `cuerpo` esté vacío, la página del artículo muestra un aviso de
 * preparación y se marca noindex: publicar páginas vacías en Google resta
 * credibilidad al dominio.
 *
 * Sin fotografía por ahora: las tarjetas van en blanco hasta que existan
 * imágenes propias de cada tema. Prestar una foto de producto aquí
 * confundiría el contenido del artículo.
 */
export type Articulo = {
  slug: string;
  categoria: string;
  titulo: string;
  /** Vacío = artículo en preparación. */
  cuerpo: string;
};

export const ARTICULOS: Articulo[] = [
  {
    slug: "como-cuidar-tu-joya-en-oro-ley-750",
    categoria: "Cuidado",
    titulo: "Cómo cuidar tu joya en oro Ley 750",
    cuerpo: "",
  },
  {
    slug: "zafiro-azul-que-significa",
    categoria: "Piedras",
    titulo: "Zafiro azul: qué significa y a quién acompaña",
    cuerpo: "",
  },
  {
    slug: "oro-ley-750-que-es",
    categoria: "El oficio",
    titulo: "Oro Ley 750: qué es y por qué importa",
    cuerpo: "",
  },
  {
    slug: "el-elefante-con-la-trompa-arriba",
    categoria: "Símbolos",
    titulo: "El elefante con la trompa arriba: origen de un símbolo",
    cuerpo: "",
  },
];

export function articuloPorSlug(slug: string): Articulo | undefined {
  return ARTICULOS.find((a) => a.slug === slug);
}
