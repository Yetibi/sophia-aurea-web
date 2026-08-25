import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { ETIQUETA_CATALOGO } from "@/lib/productos";

/**
 * Refresca el catálogo sin esperar los 5 minutos de caché ni redesplegar.
 *
 * Uso: POST https://sophiaaurea.co/api/revalidar?secreto=XXXX
 *
 * Pensado para engancharlo a un flujo de Power Automate disparado cuando
 * cambia TablaProductos.xlsx: así, editar el Excel actualiza el sitio.
 */
export async function POST(peticion: Request) {
  const secretoEsperado = process.env.REVALIDAR_SECRETO;
  if (!secretoEsperado) {
    return NextResponse.json({ error: "REVALIDAR_SECRETO sin configurar" }, { status: 503 });
  }

  const { searchParams } = new URL(peticion.url);
  const enviado =
    searchParams.get("secreto") ?? peticion.headers.get("x-revalidar-secreto") ?? "";

  if (enviado !== secretoEsperado) {
    return NextResponse.json({ error: "Secreto incorrecto" }, { status: 401 });
  }

  revalidateTag(ETIQUETA_CATALOGO);
  revalidatePath("/");
  revalidatePath("/catalogo");

  return NextResponse.json({ ok: true, actualizado: new Date().toISOString() });
}
