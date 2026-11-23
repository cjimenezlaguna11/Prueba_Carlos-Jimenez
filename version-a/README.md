# Giunti Psychometrics Italia · Version A

Landing italiana de un catálogo ficticio de instrumentos de assessment y cursos para profesionales de la psicología. Ofrece búsqueda local, filtros, preferencias de apariencia y un formulario de demostración. Las fichas describen productos ficticios y el formulario simula el envío en el navegador.

## Requisitos y stack

Se verificó con Node.js **24.20.0** y npm **11.6.1**. Usa Node **24.x** y el lockfile de esta carpeta. Las versiones instaladas incluyen Next.js **16.4.6** (App Router), React y React DOM **19.3.1**, TypeScript **5.9.3** en modo estricto, Tailwind CSS **4.3.5** y ESLint **10.15.0**.

## Ejecutar desde el monorepo

```sh
cd version-a
npm ci
npm run dev
```

Abre la aplicación en `http://localhost:3000`. El catálogo local funciona con la configuración por defecto y sin credenciales. Si necesitas declarar explícitamente la fuente, usa `CATALOG_SOURCE=json` en un `.env.local`. El ejemplo de configuración está en [.env.example](.env.example).

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

`npm run typecheck` regenera los tipos de ruta antes de ejecutar `tsc --noEmit`. `npm test` comprueba búsqueda, filtros, orden, precios, fechas y validación de contacto con el runner de Node. Para el recorrido real, deja el servidor activo y corre `npm run test:browser` en otra terminal. Requiere Chrome instalado. `CHROME_PATH` permite elegir su ejecutable, `APP_URL` cambia la URL local y `SCREENSHOT_DIR` habilita las capturas. Consulta los resultados en [QA-REPORT.md](../QA-REPORT.md).

## Arquitectura

| Ruta | Responsabilidad |
| --- | --- |
| `src/app/` | Composición App Router, layout italiano con script temprano de tema y adaptador CSS de Tailwind. |
| `src/components/layout/` | Marca, navegación, selector nativo y pie. |
| `src/components/sections/` | Hero, catálogo, orientación profesional y contacto. |
| `src/components/catalog/` | Cuadrícula y filtros del cliente con fichas renderizadas por servidor. |
| `src/components/cart/` | Contexto, botones de ficha y header, y carrito lateral. |
| `src/data/catalog.ts`, `src/types/` | Lector de servidor y contrato de producto discriminado por tipo. |
| `src/lib/`, `tests/` | Normalización, precios y fechas, validación, estado de apariencia y pruebas. |
| `../scripts/prepare-version-a.mjs` | Preparación de datos, tokens y arte local para desarrollo, tipos y build. |

La composición, ficha de producto y formateo inicial se ejecutan en servidor. Las islas cliente gestionan navegación, filtros, el selector y el formulario. Los enlaces de categoría comparten la selección del catálogo sin reiniciar la consulta. El HTML inicial incluye las ocho fichas. La entrega JSON se prerenderiza en producción.

## Design System y apariencia

[Los tokens JSON](../specs/design-tokens.json) son la fuente canónica. La preparación comprueba [la proyección CSS](../specs/design-tokens.css), genera los breakpoints de Tailwind y empaqueta ambos archivos. `@theme inline` enlaza las utilidades con las variables compartidas. La cuadrícula usa una columna por defecto, dos desde `md` y tres desde `lg`.

`Aspetto` ofrece `Chiaro`, `Scuro` y `Sistema`. El script en el head aplica la preferencia antes de la hidratación y del primer pintado. `Sistema` sigue al SO en vivo. La elección persiste en `localStorage`, se sincroniza entre pestañas del mismo origen y funciona en memoria cuando se bloquea el almacenamiento. Con JS desactivado, el CSS sigue la preferencia del SO y el formulario queda deshabilitado.

## Datos y decisiones visuales

El script de preparación copia [el catálogo canónico](../specs/products.json). El lector de servidor valida IDs, tipos, categorías, precios y fechas, preserva el orden y entrega a la vista el mismo DTO previsto para un futuro lector Supabase. La fase actual admite `json`. Activar otro origen requiere implementar el adaptador según la [arquitectura del catálogo](../specs/catalog-architecture.md).

- La ilustración del hero reproduce el SVG del prototipo y se conserva en `../assets/catalog/`. Header, footer y favicon usan el PNG oficial de 974×300 px, almacenado en `public/giunti-psychometrics.png` con su transparencia original. Las portadas se exportaron desde los motivos SVG de Figma Make a WebP de 800×480 y se sirven con dimensiones declaradas y carga diferida. Inter variable Latin se sirve localmente desde Fontsource bajo OFL. [PNG oficial de Giunti Psychometrics](https://www.giuntipsy.com/it-it/media/logo/default/Logo_Color_RGB-2026.png).
- La navegación completa pasa a 1024 px para dar espacio al buscador, a `Aspetto` y a `Accedi`. En pantallas más estrechas, las categorías saltan de línea. Los temas usan roles de contraste, indicadores de foco visibles y movimiento reducido.
- `Scopri di più` abre una ficha de demostración dentro de la card. `Accedi` muestra una explicación de la demo. Los íconos sociales del footer son estáticos y tienen nombres accesibles. El texto de contacto identifica la simulación desde el inicio.
- Los precios usan `Intl.NumberFormat` con céntimos enteros y agrupación italiana. Las fechas de cursos se formatean en UTC para preservar el día civil.

## Carrito demostrativo

El botón cuadrado de cada ficha añade una unidad y anuncia el cambio. El contador del header muestra la suma de unidades y abre el carrito lateral. Se pueden cambiar cantidades, eliminar fichas y vaciar el carrito. El subtotal usa los precios con descuento del catálogo en céntimos enteros. El carrito simula la selección y no permite compras.

El contexto persiste únicamente IDs y cantidades en `giunti.cart.v1` de `localStorage`. Cada producto admite hasta 99 unidades. Se validan las entradas contra el catálogo y, con almacenamiento bloqueado, el carrito funciona en memoria. La lectura tras hidratar mantiene estable el HTML inicial del servidor.

El diálogo nativo usa `showModal()` para aislar el fondo. El foco inicial va a Cerrar, Tab queda contenido y Escape, el botón X o el fondo cierran el carrito. El foco vuelve al botón del header. Desde el estado vacío, `Esplora il catalogo` lleva el foco al catálogo. Los anuncios usan regiones de estado y la animación respeta el movimiento reducido.

## Producción en Vercel

La aplicación está disponible en [la URL pública de producción](https://prueba-carlos-jimenez-version-a.vercel.app). El primer deployment verificado corresponde al commit `c6bbfc0` de `main`.

Importar el monorepo existente `cjimenezlaguna11/Prueba_Carlos-Jimenez` en Vercel o reutilizar el proyecto vinculado a este repositorio. Usar estos ajustes:

| Ajuste | Valor |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | `version-a` |
| Include source files outside of the Root Directory | Activado |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Node.js Version | `24.x` (validado localmente con `24.20.0`) |
| Production Branch | `main` |

La preparación lee `specs/`, `scripts/` y `assets/` del monorepo y genera las entradas locales antes de `next build`. El lockfile y el logo están en `version-a/`. `CATALOG_SOURCE=json` es el valor por defecto y puede declararse en Production. El build funciona sin credenciales ni variables adicionales. Los cambios en las entradas compartidas deben disparar builds.

Después de un deployment de **Production**, abrir la URL pública HTTPS desde un navegador sin sesión, comprobar los recursos y ejecutar `npm run test:browser` con `APP_URL` apuntando a esa URL. Registrar el dominio verificado y el SHA en el reporte de QA. El carrito y el formulario son demostrativos. Las preferencias y las cantidades se conservan localmente en el navegador. Con React Developer Tools 8.0.0, el aviso de instrumentación del buscador se reprodujo en desarrollo. [Plan de producción](../specs/deployment-architecture.md) · [Monorepos en Vercel](https://vercel.com/docs/monorepos/monorepo-faq) · [Versiones de Node en Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
