/**
 * Capa de canal de venta.
 *
 * Hoy la venta cierra por WhatsApp. Mañana puede cerrar con pasarela sin tocar
 * ni un componente de la interfaz: la UI solo conoce `canalActivo()` y llama
 * `iniciarCompra()`. Cambiar de canal es cambiar una variable de entorno y
 * completar un adaptador.
 *
 * Por eso el modelo de datos ya carga `precioCop` y `stock` aunque el sitio
 * todavia no muestre precios: cuando se active la pasarela, el dato ya esta.
 */

import type { Pieza } from "./tipos";

export type IdCanal = "whatsapp" | "wompi" | "mercadopago";

export type IntencionDeCompra = {
  pieza: Pieza;
  cantidad: number;
  /** De donde salio el clic: alimenta la atribucion en GA4. */
  origen: "catalogo" | "detalle" | "portada" | "footer";
};

export type ResultadoCheckout =
  | { tipo: "redireccion"; url: string; nuevaPestana: boolean }
  | { tipo: "no-disponible"; motivo: string };

export interface CanalDeVenta {
  id: IdCanal;
  /** Etiqueta del boton. Un mismo verbo en toda la experiencia. */
  etiqueta: string;
  configurado(): boolean;
  iniciarCompra(intencion: IntencionDeCompra): ResultadoCheckout;
}

/* ── Canal activo hoy: WhatsApp ────────────────────────────── */

const NUMERO = process.env.NEXT_PUBLIC_WHATSAPP ?? "";

function mensajeParaPieza({ pieza }: IntencionDeCompra): string {
  // El SKU viaja en el mensaje: es la unica forma real de atribuir una
  // conversacion de WhatsApp a una pieza del sitio (wa.me descarta los UTM).
  // El origen NO se incluye: era un codigo interno ("detalle") que el cliente
  // veia en su propio chat sin entender que significaba.
  const detalle = [pieza.tipoPieza, pieza.piedra].filter(Boolean).join(" · ");
  const lineas = [
    `Hola, vengo del sitio de Sophia Auréa.`,
    `Me interesa ${pieza.nombre}${detalle ? ` (${detalle})` : ""}.`,
    `Ref: ${pieza.sku}`,
  ];
  return lineas.join("\n");
}

export const canalWhatsApp: CanalDeVenta = {
  id: "whatsapp",
  etiqueta: "Escribir por WhatsApp",
  configurado: () => /^\d{10,15}$/.test(NUMERO),
  iniciarCompra(intencion) {
    if (!this.configurado()) {
      return {
        tipo: "no-disponible",
        motivo: "Falta configurar NEXT_PUBLIC_WHATSAPP con el numero de la marca.",
      };
    }
    const texto = encodeURIComponent(mensajeParaPieza(intencion));
    return {
      tipo: "redireccion",
      url: `https://wa.me/${NUMERO}?text=${texto}`,
      nuevaPestana: true,
    };
  },
};

/* ── Canal proyectado: pasarela de pagos ───────────────────────
 *
 * Cuando llegue el momento de vender directo en la web:
 *
 * 1. Crear cuenta de comercio (Wompi de Bancolombia es lo mas directo en CO;
 *    Mercado Pago si se quiere cuotas sin tarjeta).
 * 2. Cargar WOMPI_LLAVE_PUBLICA / WOMPI_LLAVE_PRIVADA / WOMPI_SECRETO_EVENTOS.
 * 3. Implementar `iniciarCompra` creando la transaccion en el servidor
 *    (nunca desde el cliente) y devolviendo la URL de checkout.
 * 4. Agregar POST /api/pagos/eventos para recibir la confirmacion firmada y,
 *    desde ahi, escribir la venta en TablaSalidas + TablaIngresos del SOI.
 * 5. Cambiar NEXT_PUBLIC_CANAL_VENTA=wompi. La interfaz no cambia.
 *
 * El adaptador queda declarado para que la forma del contrato ya exista.
 */
export const canalWompi: CanalDeVenta = {
  id: "wompi",
  etiqueta: "Comprar ahora",
  configurado: () => false,
  iniciarCompra() {
    return {
      tipo: "no-disponible",
      motivo: "La pasarela de pagos aun no esta activa. Ver src/lib/comercio.ts.",
    };
  },
};

const CANALES: Record<IdCanal, CanalDeVenta> = {
  whatsapp: canalWhatsApp,
  wompi: canalWompi,
  mercadopago: { ...canalWompi, id: "mercadopago" },
};

/** Canal configurado por entorno, con WhatsApp como respaldo siempre valido. */
export function canalActivo(): CanalDeVenta {
  const id = (process.env.NEXT_PUBLIC_CANAL_VENTA ?? "whatsapp") as IdCanal;
  const canal = CANALES[id] ?? canalWhatsApp;
  return canal.configurado() ? canal : canalWhatsApp;
}

/**
 * Enlace de contacto general, sin pieza asociada.
 *
 * El mensaje se redacta según de dónde salga el clic: quien escribe desde la
 * portada no viene de una pieza concreta, y decirle "me interesa esta pieza"
 * confunde a quien atiende. El origen se traduce a lenguaje natural en vez de
 * mandar el código interno, que el cliente veía en su propio chat.
 */
export function enlaceWhatsAppGeneral(origen: string): string {
  const texto = encodeURIComponent(mensajeGeneral(origen));
  return `https://wa.me/${NUMERO}?text=${texto}`;
}

/** Contexto legible por origen. La clave sigue sirviendo para atribución. */
function mensajeGeneral(origen: string): string {
  const saludo = "Hola, vengo del sitio de Sophia Auréa.";

  // Colección: el slug viene en el origen (p. ej. "coleccion-fortuna")
  if (origen.startsWith("coleccion-")) {
    const nombre = origen
      .slice("coleccion-".length)
      .replace(/-/g, " ")
      .replace(/^./, (c) => c.toUpperCase());
    return `${saludo}\nMe interesa la colección ${nombre} y quiero saber más.`;
  }

  // Categoría: "categoria-dijes" → "los dijes"
  if (origen.startsWith("categoria-")) {
    const nombre = origen.slice("categoria-".length).replace(/-/g, " ");
    return `${saludo}\nQuiero saber más sobre ${nombre}.`;
  }

  return `${saludo}\nQuiero saber más sobre las joyas.`;
}

// El negocio decidió mostrar precios (filtro de contacto). Se puede apagar con
// NEXT_PUBLIC_MOSTRAR_PRECIOS=false sin tocar código.
export const MOSTRAR_PRECIOS = process.env.NEXT_PUBLIC_MOSTRAR_PRECIOS !== "false";
