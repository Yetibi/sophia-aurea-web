# Sophia Auréa — Website · Reglas del proyecto

Este archivo lo lee Claude Code automáticamente al abrir la carpeta. Vale
también como guía para cualquier persona que toque el código.

Sophia Auréa es una marca de joyería fina en Medellín (oro Ley 750 y piedras
naturales). Este proyecto es el **website de marca**, no el catálogo
operativo. Ver `README.md` para arquitectura y despliegue.

---

## 1. Reglas que no se negocian

### Copy y contenido
- **El copy de piezas y de marca es texto validado por la fundadora.** No se
  edita, no se "mejora", no se parafrasea, no se traduce, no se completa.
- **Nunca inventes simbolismo.** Los significados de piedras, figuras y
  colecciones vienen del catálogo validado. Si falta un dato, el bloque
  colapsa: no se rellena con texto plausible.
- **Nunca inventes datos de producto**: nombres, precios, medidas,
  disponibilidad. Todo viene de TablaProductos vía Graph. Si no llegan datos,
  se muestra el aviso correspondiente — no se crean datos de prueba para
  "que se vea bien".
- Textos de interfaz nuevos (botones, avisos) sí se pueden escribir, en
  español de Colombia, tono cálido y sobrio. Nada de signos de exclamación
  ni lenguaje de venta agresiva.

### Identidad visual
- Paleta fija, definida en `src/app/globals.css`:
  - marfil `#F7F1E6` · marfil-2 `#F2EADC` · superficie `#FDFBF7`
  - **oro `#C8A064` es ORNAMENTAL: nunca texto** (rinde 2.15:1, falla WCAG)
  - oro-texto `#7E6039` — todo "dorado" legible
  - tinta `#4A3A22` — texto principal
- **Usa siempre las variables CSS** (`var(--tinta)`), nunca hex sueltos en
  componentes. Si necesitas un color nuevo, se agrega al sistema, no al
  componente.
- Tipografías: Cormorant Garamond (display), Montserrat (interfaz), Pinyon
  Script (solo la firma de marca, una vez por página). No agregar otras.
- Radio de borde 2px en todo. La marca es grabado, no burbuja.
- Un solo color de énfasis por pantalla.

### SEO
- **No cambiar slugs de piezas publicadas.** Rompe URLs ya indexadas por
  Google y destruye posicionamiento acumulado.
- Toda página nueva necesita: un solo `<h1>`, `metadata` con title y
  description, y `canonical`.
- El JSON-LD se renderiza en servidor (ver `src/lib/seo.ts`). No moverlo a
  cliente.
- Una categoría o colección que existe nunca devuelve 404 por un fallo de
  datos: devuelve la página con aviso. Un 404 le dice a Google que
  desindexe.

### Accesibilidad (WCAG 2.2 AA — obligatorio)
- Contraste mínimo 4.5:1 en texto, 3:1 en bordes interactivos y foco.
- Elemento nativo antes que ARIA: `<button>`, `<dialog>`, `<fieldset>`.
- Foco visible siempre (2px, color tinta). Nunca `outline: none` sin
  reemplazo.
- Objetivos táctiles ≥44px. Inputs ≥16px en móvil (evita zoom de iOS).
- Toda imagen con `alt` descriptivo; decorativas con `alt=""` o
  `aria-hidden`.
- El color nunca es el único portador de información: la piedra siempre va
  acompañada de su nombre en texto.
- Respetar `prefers-reduced-motion`.

### Datos y seguridad
- **`.env.local` nunca se commitea, nunca se imprime en consola, nunca se
  pega en un chat.** Las credenciales las escribe la persona directamente en
  el archivo.
- `src/lib/graph.ts` y `src/lib/productos.ts` son `server-only`. No
  importarlos desde componentes de cliente.
- No modificar el mapeo de columnas de `productos.ts` para "hacer que
  funcione". Si los datos no llegan, diagnostica la causa y repórtala.

---

## 2. Convenciones de código

- **Español** en nombres de variables, funciones y comentarios.
- Los comentarios explican **por qué**, no qué. El qué se lee en el código.
- TypeScript estricto. Nada de `any`.
- Componentes de servidor por defecto; `"use client"` solo cuando hay estado
  o eventos.
- Estilos en `globals.css` con clases semánticas. Sin librerías de CSS
  nuevas.
- Nada de `localStorage`/`sessionStorage`.

---

## 3. Arquitectura — qué hace cada cosa

```
src/lib/
  graph.ts       Autenticación y llamadas a Microsoft Graph (server-only)
  productos.ts   Lee TablaProductos y la mapea a piezas (server-only)
  tipos.ts       Tipo Pieza y utilidades compartidas servidor/cliente
  comercio.ts    Canal de venta: WhatsApp hoy, pasarela mañana
  site.ts        Constantes de marca, colecciones, colores de piedra
  seo.ts         JSON-LD
  politicas.ts   Textos legales (con marcadores [REVISAR])
src/app/
  page.tsx              Portada
  [tipo]/               Categoría por tipo de pieza (dijes, aretes…)
  joyas/[slug]/         Página de pieza — núcleo SEO
  colecciones/[slug]/   Colección
  politicas/            Legal
  api/foto/[nombre]/    Sirve fotos desde OneDrive
  api/revalidar/        Refresca el catálogo sin redesplegar
```

**Regla de oro de la arquitectura:** ningún componente sabe de dónde vienen
los datos. Todo pasa por `productos.ts`. El día que se migre de Excel a una
base de datos, se reescribe ese archivo y nada más.

---

## 4. Antes de dar por terminado un cambio

1. `npx tsc --noEmit` sin errores.
2. `npm run build` sin errores.
3. Si tocaste UI: verifica contraste, navegación con teclado y foco visible.
4. Si tocaste datos: confirma que un campo vacío colapsa el bloque en vez de
   mostrar un hueco.
5. No dejes `console.log` de depuración.

---

## 5. Qué hacer cuando algo no está claro

**Pregunta antes de asumir.** Este proyecto tiene decisiones de negocio
detrás de casi cada detalle (por qué el catálogo está separado, por qué la
navegación va por tipo de pieza, por qué el oro no se usa como texto). Si
una tarea parece requerir romper una regla de arriba, es señal de que falta
contexto — no de que la regla esté mal.

Nunca:
- Inventes contenido para llenar un vacío.
- "Arregles" un error de datos modificando el código que los lee.
- Agregues dependencias sin justificarlo.
- Cambies la estructura de rutas o el modelo de datos por tu cuenta.
