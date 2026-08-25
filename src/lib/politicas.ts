/**
 * Textos base de las políticas del sitio.
 *
 * IMPORTANTE: son borradores de partida razonables para un comercio colombiano,
 * NO asesoría legal. Antes de publicar, la fundadora debe revisar cada
 * [REVISAR: ...] y validar el conjunto — idealmente con un abogado, en especial
 * tratamiento de datos (Ley 1581 de 2012) y garantías (Estatuto del Consumidor,
 * Ley 1480 de 2011).
 */

export type Politica = {
  slug: string;
  titulo: string;
  descripcion: string;
  secciones: { titulo: string; parrafos: string[] }[];
};

const RAZON_SOCIAL = "[REVISAR: razón social o nombre del responsable]";
const NIT = "[REVISAR: NIT o cédula]";
const CORREO = "hola@sophiaaurea.co";

export const POLITICAS: Politica[] = [
  {
    slug: "tratamiento-de-datos",
    titulo: "Política de tratamiento de datos personales",
    descripcion:
      "Cómo Sophia Auréa recoge, usa y protege los datos personales, conforme a la Ley 1581 de 2012.",
    secciones: [
      {
        titulo: "Responsable del tratamiento",
        parrafos: [
          `${RAZON_SOCIAL}, identificado con ${NIT}, con domicilio en Medellín, Colombia, correo ${CORREO}, es el responsable del tratamiento de los datos personales recogidos a través de este sitio y de los canales de atención de Sophia Auréa (WhatsApp e Instagram).`,
        ],
      },
      {
        titulo: "Datos que se recogen y para qué",
        parrafos: [
          "Al escribirnos por WhatsApp o redes sociales recibimos tu nombre, número de contacto y el contenido de la conversación. Usamos esos datos únicamente para: responder tus consultas, gestionar pedidos y entregas, emitir certificados de autenticidad, y — solo si lo autorizas — enviarte información sobre nuevas piezas.",
          "Este sitio usa Google Analytics para medir visitas de forma agregada. No vendemos ni cedemos datos personales a terceros con fines comerciales.",
        ],
      },
      {
        titulo: "Tus derechos",
        parrafos: [
          "Como titular puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar la autorización otorgada, conforme a la Ley 1581 de 2012 y sus decretos reglamentarios. Para ejercerlos, escribe a " +
            CORREO +
            " indicando tu solicitud. Responderemos dentro de los términos que fija la ley.",
          "Si consideras que no atendimos tu solicitud, puedes acudir a la Superintendencia de Industria y Comercio (SIC), autoridad de protección de datos en Colombia.",
        ],
      },
      {
        titulo: "Vigencia",
        parrafos: [
          "Los datos se conservan mientras exista una relación comercial o de atención contigo y durante los plazos que exija la ley. [REVISAR: fecha de entrada en vigencia de esta política].",
        ],
      },
    ],
  },
  {
    slug: "envios-y-devoluciones",
    titulo: "Política de envíos, cambios y garantía",
    descripcion:
      "Tiempos de entrega, condiciones de cambio y garantía de las piezas Sophia Auréa.",
    secciones: [
      {
        titulo: "Envíos",
        parrafos: [
          "Realizamos envíos a todo Colombia con transportadora asegurada. [REVISAR: transportadora, tiempos por ciudad y costo o umbral de envío gratis].",
          "Cada pieza viaja en su empaque de marca, con su paño limpiador y su certificado de autenticidad.",
        ],
      },
      {
        titulo: "Cambios y retracto",
        parrafos: [
          "Para compras no presenciales aplica el derecho de retracto del artículo 47 de la Ley 1480 de 2011: puedes desistir de la compra dentro de los cinco (5) días hábiles siguientes a la entrega, devolviendo la pieza sin uso, en perfecto estado y con su empaque y certificado. Los costos de transporte de la devolución corren por cuenta del comprador, según la misma ley.",
          "[REVISAR: condiciones para piezas personalizadas o hechas sobre pedido — la ley permite excepciones al retracto para bienes confeccionados conforme a especificaciones del comprador].",
        ],
      },
      {
        titulo: "Garantía",
        parrafos: [
          "Nuestras piezas en oro 18K (ley 750) y piedras naturales cuentan con garantía por defectos de fabricación de [REVISAR: plazo, p. ej. un año] a partir de la entrega, acreditada con el certificado de la pieza. La garantía no cubre desgaste por uso, golpes, pérdida de piedras por maltrato ni intervenciones de terceros.",
        ],
      },
    ],
  },
  {
    slug: "terminos-y-condiciones",
    titulo: "Términos y condiciones",
    descripcion: "Condiciones de uso del sitio y de compra de piezas Sophia Auréa.",
    secciones: [
      {
        titulo: "Sobre el sitio",
        parrafos: [
          `Este sitio es una vitrina de las piezas de Sophia Auréa, operada por ${RAZON_SOCIAL}. Los precios, cuando se muestren, están en pesos colombianos (COP) e incluyen los impuestos aplicables. Hoy la venta se concreta por WhatsApp; al habilitarse el pago en línea, estas condiciones se complementarán con las de la pasarela.`,
        ],
      },
      {
        titulo: "Disponibilidad y naturaleza de las piezas",
        parrafos: [
          "Trabajamos con piedras naturales: cada gema tiene variaciones de tono e inclusiones propias, por lo que la pieza entregada puede diferir levemente de la fotografía. Esa singularidad es característica del producto, no un defecto.",
          "La disponibilidad mostrada en el catálogo es informativa y se confirma en la conversación de venta.",
        ],
      },
      {
        titulo: "Propiedad intelectual",
        parrafos: [
          "La marca Sophia Auréa, su logotipo, los nombres de las colecciones y los textos de este sitio son de uso exclusivo de la marca y no pueden reproducirse sin autorización escrita.",
        ],
      },
      {
        titulo: "Protección al consumidor",
        parrafos: [
          "Nuestra actuación se rige por el Estatuto del Consumidor (Ley 1480 de 2011). La autoridad competente es la Superintendencia de Industria y Comercio — sic.gov.co. Para peticiones, quejas o reclamos escribe a " +
            CORREO +
            ".",
        ],
      },
    ],
  },
];

export function politicaPorSlug(slug: string): Politica | undefined {
  return POLITICAS.find((p) => p.slug === slug);
}
