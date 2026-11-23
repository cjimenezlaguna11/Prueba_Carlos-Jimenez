# Verificación · Version A

Entorno probado el 22 de noviembre de 2026. Windows, Node 24.20.0, npm 11.6.1, Next.js 16.4.6 y Chrome 157.0.8103.79. Las pruebas de navegador usaron el build de producción servido en loopback y axe-core 4.14.1. El catálogo activo fue el JSON canónico.

## Comandos

| Comando ejecutado desde `version-a/` | Resultado |
| --- | --- |
| `npm ci --offline --no-audit` | Correcto. Instalación desde el lockfile y la caché local de npm. |
| `npm run typecheck` | Correcto. Tipos de ruta y `tsc --noEmit`. |
| `npm run lint` | Correcto. Cero errores y advertencias de ESLint. |
| `npm test` | 8 de 8. Catálogo, búsqueda, filtros, inmutabilidad, orden, formato EUR/fecha y validación del formulario. |
| `npm run build` | Correcto. Next.js prerenderizó `/` con las ocho fichas iniciales. |
| `npm run test:browser` | 17 de 17 contra `npm run start -- --hostname 127.0.0.1 --port 3180`, con `APP_URL=http://127.0.0.1:3180`. |

## Navegador

| Comprobación | Resultado observado |
| --- | --- |
| 375, 768, 1280 px en ambos temas | 1, 2 y 3 columnas respectivamente. Sin desplazamiento horizontal. Imágenes decodificadas y seis ejecuciones de axe sin infracciones para las reglas automatizadas WCAG A y AA seleccionadas. |
| Reflujo estrecho y movimiento | Sin overflow a 320 CSS px con el menú abierto. Con movimiento reducido el desplazamiento es inmediato. |
| Navegación y catálogo | Menú compacto por teclado, Escape devuelve el foco. `Formazione` selecciona su categoría. El acceso a búsqueda enfoca el campo. Se comprobaron diacríticos, cruce de filtros, vacío, reinicios y apertura de `Scopri di più`. |
| Contacto | Foco sucesivo sobre nombre, email y mensaje inválidos. Asociación con el error, confirmación simulada, retorno de foco al reiniciar y ninguna navegación o petición de envío. |
| Apariencia | Cambio manual por teclado con foco y valores preservados. Persistencia tras recarga, sincronización de pestañas y seguimiento del SO en `Sistema`. Se comprobó Dark guardado antes de hidratar con scripts externos bloqueados, fallback CSS sin JS y cambio en memoria con almacenamiento bloqueado. |

## Comparación con Figma Make

Se ejecutó una copia temporal de `Prueba/` con su lockfile y Vite 8.1.7. Se tomaron y revisaron capturas a 375, 768 y 1280 px del prototipo claro y de A en claro y oscuro. Coinciden la composición de secciones, proporciones del hero y portadas, distribución de fichas y estructura visual del contacto y el pie. Vite avisó que el `@import` de Google Fonts quedó después de otras reglas del prototipo e Inter no se cargó en esa captura. A sirve Inter localmente, lo que explica parte de la variación en los saltos de línea.

La comparación detectó una colisión entre el nombre de un color y el tamaño del H1 en Tailwind. Se corrigió el alias y se verifican el color calculado y los tamaños 40, 48 y 64 px del título. Las diferencias deliberadas son el menú compacto hasta `lg`, las categorías en varias filas en móvil, bordes y foco reforzados, el selector `Aspetto`, el detalle de ficha y los textos de demostración. La maqueta original conserva sus 27 archivos con los mismos hashes SHA-256.

## Diagnóstico de React DevTools en la búsqueda

En Chrome 157.0.8103.79 se comparó la misma secuencia en perfiles aislados. Escribir `Equilibria` carácter por carácter, cambiar a `zorro`, vaciar el campo, escribir `Neurovia` y terminar con `Équilibria`. En los cuatro escenarios se obtuvo la ficha canónica `equilibria`.

| Escenario | Consola y resultado |
| --- | --- |
| Desarrollo con React Developer Tools 8.0.0 | Se reprodujo el mensaje exacto. La primera llamada del stack fue `updateFiberRecursively` en `chrome-extension://fmkadmapgofadopljbjfkapdkoienihi/build/installHook.js:1:114434`, seguida de `updateVirtualChildrenRecursively` y `updateChildrenRecursively`. El catálogo siguió actualizándose y el navegador no registró excepciones sin capturar. |
| Desarrollo sin extensiones, con Playwright | Secuencia completa sin errores de consola. Los dos casos de regresión del catálogo también pasaron en claro y oscuro. |
| Producción local sin extensiones, con Playwright | Secuencia completa y 17 pruebas de navegador sin fallos. |
| Producción local con React Developer Tools 8.0.0 | El hook estaba activo y la secuencia completó sin emitir el mensaje. |

El entorno tiene instalados Next.js 16.4.6 y React y React DOM 19.3.1. En desarrollo el hook registró tres interfaces, entre ellas `react-server-dom-turbopack`, con versión de renderer `19.3.0-canary-278794d7-20261002`. En producción registró una interfaz `react-dom` de esa misma versión. La excepción observada procede de la instrumentación de la extensión para la combinación probada en desarrollo. Queda por precisar la condición interna de esa instrumentación que dispara la aserción en esta página. El repositorio de React documenta la misma aserción en un caso del backend de DevTools. [React DevTools PR #37475](https://github.com/facebook/react/pull/37475).

La revisión confirmó IDs únicos en el lector y `key={id}` en las fichas. El filtro usa `Array.filter` sobre datos de solo lectura, y las actualizaciones de consulta y categoría suceden en manejadores. Las pruebas comprueban entradas consecutivas y rápidas, diacríticos, resultado vacío, combinación y reinicio de filtros, orden del JSON, recuentos e identidad DOM de la ficha que permanece visible. El cambio quedó en pruebas y documentación.

En el seguimiento con DevTools 8.0.0 activo, sesiones nuevas aceptaron `Equilibria` (1 resultado), `xxx` (0) y el paso directo de `xxx` a `Equilibria` (1) sin el mensaje. En cambio, al repetir `Equilibria` → `zorro` → campo vacío → `Neurovia`, el mensaje apareció al escribir `Neurovia`, con la ficha correspondiente visible. La coincidencia por sí sola no bastó para reproducirlo. El mapa de código fuente de la extensión ubica `installHook.js:1:114434` en `react-devtools-shared/src/backend/fiber/renderer.js:4777`. [Código fuente de la revisión de DevTools distribuida por Chrome](https://github.com/facebook/react/blob/1d34f91dfd/packages/react-devtools-shared/src/backend/fiber/renderer.js#L4777).

## Metadatos y carrito demostrativo

TypeScript estricto, ESLint y build de producción correctos. Pasaron 10 pruebas unitarias y 24 de navegador sobre el build local en Chrome. Los seis casos del carrito a 375, 768 y 1280 px cubren ambos temas, alineación de metadatos de un test y un curso, altura de las acciones, ausencia de desbordamiento y reglas WCAG automatizadas de axe en el diálogo abierto. Con las ocho fichas, el listado se desplaza y el subtotal y la acción principal permanecen visibles.

Se verificaron el contador por unidades, el subtotal en céntimos, la persistencia con datos canónicos, la validación de entradas y el funcionamiento en memoria con almacenamiento bloqueado. El recorrido de teclado cubrió foco inicial, ciclo de Tab, Escape y retorno. También se probaron el cierre con X y fondo, los dos CTA del diálogo, el estado vacío, la respuesta al cambio del sistema, el movimiento reducido y el reflujo a 320 px. Se revisaron capturas de fichas y del carrito en claro y oscuro.

## Prevalidación de producción en Vercel

Se preparó una copia limpia con 63 archivos fuente de `version-a/` y sus entradas del monorepo, sin módulos instalados ni caché. En Windows con Node 24.20.0 y npm 11.6.1 pasaron `npm ci` (0 vulnerabilidades reportadas), TypeScript estricto, ESLint, 10 pruebas unitarias, `npm run build` y 24 pruebas de navegador contra ese build local. Se comprobó el reflujo a 375, 768 y 1280 px en claro y oscuro.

La respuesta inicial sirvió los ocho IDs del JSON en orden. El logo, el SVG del hero y las ocho portadas respondieron con HTTP 200 y coincidieron con los archivos del build. La búsqueda de referencias a localhost en código productivo y HTML inicial, y de patrones de credenciales en el contenido de entrega, no encontró coincidencias. `CATALOG_SOURCE=json` funcionó sin credenciales. El build regeneró `.generated/` y `public/images/` desde `specs/`, `scripts/` y `assets/`.

## Validación en producción

Tras autorizar Git Credential Manager y la app de Vercel para el monorepo, se publicó el commit `c6bbfc0` en `main`. Vercel lo desplegó en Production con estado Ready, Next.js 16.4.6, Node 24.x, raíz `version-a`, acceso a archivos compartidos, `npm ci` y `npm run build`. El registro de npm incluyó avisos por la opción de entorno `cache-dir` de la plataforma. El build terminó correctamente y npm reportó 0 vulnerabilidades. [Deployment de producción](https://vercel.com/8a11jimenezc-gmailcoms-projects/prueba-carlos-jimenez-version-a/3mCkJs5GDz61q2qvcMNJuGiwQkeH).

La [URL pública HTTPS](https://prueba-carlos-jimenez-version-a.vercel.app) respondió HTTP 200 sin sesión, con HSTS. El logo oficial, el SVG del hero y las ocho portadas también respondieron HTTP 200. Las 24 pruebas de Chrome pasaron con `APP_URL` apuntando a producción. Cubrieron navegación, catálogo, filtros y detalle, carrito y subtotal, persistencia, contacto simulado, footer, temas y reflujo a 375, 768 y 1280 px, sin errores de aplicación capturados por la suite.

## Pendientes de verificación

Quedan por verificar el recorrido con lector de pantalla, otros motores de navegador, el zoom del navegador al 200 % y una medición Lighthouse. Los resultados de axe cubren los casos automatizados ejecutados, junto con los recorridos de teclado del informe. El cambio de fuente a Supabase se reserva para su fase de integración.

## Versione B · Laravel frente a Next.js

La comparación usó Next.js en Vercel y Laravel local con el catálogo JSON. Se ejecutó en Chrome con el mismo viewport de 900 px de alto, escala de dispositivo 1, tema del sistema controlado, fuentes e imágenes cargadas y movimiento reducido. Las 60 parejas cubrieron landing completa, navegación móvil o header de escritorio, categoría, búsqueda combinada, cero resultados, ficha abierta, carrito vacío y con dos productos, formulario con errores y confirmación.

| Ancho | Tema | Pares | Píxeles distintos en landing completa | Máximo en un estado |
| --- | --- | ---: | ---: | ---: |
| 375 px | Claro | 10 | 0,051 % | 0,077 % |
| 375 px | Oscuro | 10 | 0,051 % | 0,063 % |
| 768 px | Claro | 10 | 0,042 % | 0,047 % |
| 768 px | Oscuro | 10 | 0,042 % | 0,047 % |
| 1280 px | Claro | 10 | 0,047 % | 0,072 % |
| 1280 px | Oscuro | 10 | 0,047 % | 0,072 % |

La medición cuenta un píxel como distinto cuando algún canal RGB cambia más de 24 sobre 255. Todas las parejas tuvieron las mismas dimensiones. Coincidieron las medidas de header, hero, secciones, buscador, primera ficha y footer a una décima de píxel. Se ajustaron las alturas de línea del hero y las fichas y el ancho del drawer móvil después de revisar la primera pasada. Se corrigió también la captura de elementos adhesivos durante la comparación del formulario. En la pasada final persistieron diferencias pequeñas en portadas y miniaturas. Laravel sirve el WebP canónico y Next.js usa su optimizador de imágenes. Menú, estados del formulario y vacío de búsqueda registraron cero píxeles distintos por encima del umbral.

Pasaron la instalación con Composer desde lockfile, los requisitos de plataforma PHP, el lint de PHP, `php artisan route:list`, 12 comprobaciones PHP, `npm ci`, `npm run build` y 3 pruebas unitarias JavaScript. `php artisan optimize` generó las cachés de configuración, rutas, eventos y vistas. Un arranque local con `APP_ENV=production` y esas cachés respondió HTTP 200 en `/`, `/up` y los recursos comprobados. Composer y npm reportaron 0 avisos de seguridad. El lockfile limita la dependencia transitiva de Stylus a una versión corregida de glob, verificada con la compilación de las hojas de estilo.

Pasaron las nueve pruebas de navegador. Cubren el catálogo canónico de ocho fichas, búsqueda con diacríticos, filtros combinados, controles independientes, contador, foco, carrito y subtotal, persistencia, navegación del modal con teclado, validación, envío simulado y temas. Se comprobó el reflujo desde 320 px, los cambios alrededor de cada breakpoint y el tema anterior al bundle. Axe no detectó infracciones de las reglas WCAG 2.1 A/AA ejecutadas para la landing y el drawer en claro y oscuro. No se capturaron errores de aplicación en los recorridos. Las capturas y `metrics.json` se generan con `npm run test:browser`.

El Dockerfile de Railway está preparado con imágenes base verificadas en el registro, webroot público y health check `/up`. Este equipo carece de Docker y WSL, por lo que el build de la imagen queda pendiente. Quedan fuera de esta pasada la verificación con lector de pantalla, Lighthouse y otros motores de navegador. El despliegue de la versión B y la activación de Supabase están pendientes.
