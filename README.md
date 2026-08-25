# Sophia Auréa — Website v1 (Fase 5)

Website de marca en Next.js 15 + TypeScript. Lee TODO desde TablaProductos
(Excel/OneDrive) vía Microsoft Graph; fotos desde SharePoint; cierre por
WhatsApp. El catálogo operativo en /catalogo NO es parte de este proyecto:
vive en producción aparte y se enlaza como "Disponibilidad".

## Arquitectura (aprobada en el mockup con las socias)

- Navegación por TIPO DE PIEZA, generada sola desde el Excel: `/dijes`,
  `/aretes`, `/anillos`, `/pulseras` (aparecen solo los tipos que existan).
- `/joyas/[slug]` — una URL por pieza, núcleo SEO, con JSON-LD en servidor.
- `/colecciones/[slug]` — Fortuna, Amuletos del Mar, Cor Aurea.
- Home: marca + piezas destacadas (columna `destacada`) + colecciones como
  descubrimiento. Ya no gira sobre una sola colección.
- Precios VISIBLES (columna precio_venta_cop) como filtro de contacto.
- Etiqueta De línea / Edición limitada (columna tipo_disponibilidad).

## TablaProductos — columnas que lee el sitio

El sitio mapea por NOMBRE de encabezado (sin tildes/mayúsculas, con alias),
no por posición. Puedes reordenar columnas y tener columnas extra (el sitio
las ignora). Columnas reconocidas y su origen en el Excel de la marca:

| Dato en el sitio | Columna del Excel |
|---|---|
| Nombre (H1) | `producto` |
| Descripción larga / slug base | `descripcion` |
| Tipo de pieza (navegación) | `tipo_pieza` |
| Figura | `figura` |
| Colección | `coleccion` |
| Piedra | `piedra` |
| Color de piedra | `color_piedra` |
| Forma de piedra | `forma_piedra` |
| Tamaño de piedra (ficha) | `tamano_piedra_mm` |
| Tamaño / Dimensiones | `tamano`, `dimensiones` |
| Material | `material` |
| Precio visible | `precio_venta_cop` |
| Frase ancla | `frase_ancla` |
| Simboliza | `simboliza` |
| Mensaje | `mensaje` |
| Foto (archivo en SharePoint) | `ruta_foto` |

Columnas NUEVAS que agregaste (el sitio las usa si están; si no, usa respaldo):
`slug`, `copy_largo`, `tipo_disponibilidad` (linea/limitada), `destacada`
(SI/NO), `foto_alt`.

Columna de publicación: `cargar_catalogo` (SI/NO). Solo se publican las
filas marcadas SI — igual que el catálogo en producción. Una pieza sin foto
o sin copy validado se deja en NO hasta completarla.

Columnas internas que el sitio IGNORA: `kilates_piedra`, `peso_gramos_oro`,
`peso_gramos`.

URLs de categoría: el tipo de pieza se pluraliza con reglas de español
declaradas en `PLURALES` (src/lib/productos.ts). "Punto de luz" →
`/puntos-de-luz`. Si aparece un tipo nuevo cuyo plural quede raro, se agrega
ahí ANTES de publicar (cambiarlo después rompe URLs indexadas).

Reglas: `slug` estable (no cambiar tras publicar); celda vacía = bloque que
no se muestra; fotos con nombre descriptivo en /Fotos producidas.

## Variables de entorno (nombres reales del proyecto)

El sitio reutiliza los mismos nombres que el catalogo en produccion:
`AZURE_CLIENT_ID` / `AZURE_CLIENT_SECRET` / `AZURE_TENANT_ID`,
`ONEDRIVE_USER_EMAIL`, `EXCEL_FILE_NAME`, `PHOTOS_FOLDER`.

Dos variables NUEVAS que el catalogo no necesitaba:
- `CATALOGO_TABLA` — nombre de la TABLA dentro del Excel (no del archivo).
- `EXCEL_CARPETA` — carpeta del Excel en OneDrive; vacio si esta en la raiz.

Las fotos se buscan en OneDrive (no SharePoint). `PHOTOS_FOLDER` admite
varias carpetas separadas por coma y el sitio prueba cada una en orden.

## Puesta en marcha

1. `npm install`
2. Copiar `.env.example` → `.env.local` y llenar credenciales de Graph.
   (Los valores reales los pegas TÚ en el archivo; nunca se dictan a un
   agente ni se suben al repo.)
3. `npm run dev`
Sin credenciales, el sitio arranca igual: home con aviso, sin reventar.

## Despliegue en Vercel

1. Subir a GitHub (privado).
2. Vercel → importar repo (framework Next.js, auto).
3. Cargar TODAS las variables de `.env.example` en Environment Variables.
4. Asignar el dominio `sophiaaurea.co` a este proyecto.
5. El catálogo en producción: si vive en otro proyecto de Vercel, definir
   `CATALOGO_EXTERNO_URL` para que /catalogo reenvíe allá.

## Refrescar el catálogo sin redesplegar

POST `/api/revalidar?secreto=XXX` (el secreto está en `.env`). Conectable a
Power Automate cuando cambie el Excel.

## Pendientes de contenido (no bloquean el código)

- Copy validado que falte por pieza (frase, copy_largo, simboliza, mensaje).
- Presentación de colecciones Amuletos del Mar y Cor Aurea (hoy vacías en
  src/lib/site.ts → COLECCIONES_WEB).
- Datos legales en src/lib/politicas.ts (marcadores [REVISAR]).
- Fotos + foto_alt de las piezas.
