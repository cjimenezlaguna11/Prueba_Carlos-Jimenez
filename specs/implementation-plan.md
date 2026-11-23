# Plan de implementación · Giunti Psychometrics Italia

## 1. Resumen ejecutivo

`Prueba/` contiene una referencia de Figma Make en React, Vite y Tailwind. Su código define las seis secciones de la landing, ocho fichas ficticias, búsqueda y filtros locales, y un formulario simulado. Puede conservarse la composición y reutilizarse el arte original del prototipo. Las dos entregas requieren corregir la localización del documento, tomar los datos de la fuente canónica, normalizar la búsqueda, dar un destino claro a las acciones y completar la accesibilidad del formulario y la navegación.

Figma Make queda registrado como referencia visual del tema claro. Las dos versiones comparten tokens, escala responsive y preferencias de apariencia. Se mantienen el [contrato funcional](behavior-contract.md) y el [catálogo canónico](products.json). El JSON será la fuente inicial y Supabase la fuente productiva objetivo, detrás de la misma frontera de datos. La entrega requiere URLs públicas HTTPS en Vercel y Railway. Las correcciones de accesibilidad y veracidad pueden cambiar controles y textos concretos conservando la composición.

**Alcance de la verificación.** Se inspeccionaron el proyecto y los contratos, las siete Skills locales y el JSON canónico. En el entorno se encontraron Node 24.20.0 y pnpm 11.21.0. No se detectó Vite local ni servidor en los puertos 8443 o 5173. `pnpm run build` activó la resolución automática de dependencias de pnpm. Las descargas fallaron con `EACCES`. Se detuvo el intento, se retiraron los directorios temporales creados por pnpm y Vite quedó indisponible. No se obtuvieron capturas ni se ejecutaron recorridos en navegador, pruebas de teclado, lector de pantalla o mediciones de rendimiento. Las observaciones responsive corresponden a las reglas del código. Las versiones A y B todavía no existen.

## 2. Inventario del prototipo

| Área | Lo que existe | Decisión propuesta |
| --- | --- | --- |
| Arranque | `index.html` usa marcadores de Figma para idioma y título. `src/main.tsx` monta `App` mediante `createRoot` y `StrictMode`, con `src/index.css` como entrada de estilos. | Reproducir la estructura semántica con los layouts nativos y `lang="it"`. |
| Herramientas | `package.json` y `pnpm-lock.yaml` resuelven React/ReactDOM 19.2.4, Vite 8.1.7, Tailwind y su plugin Vite 4.2.2, plugin React 6.0.1, TypeScript 5.9.3 y oxfmt 0.76.0. `.mise.toml` fija Node 22 y pnpm 10.34.3. | Usar lockfiles independientes. Confirmar los parches de runtime y herramientas con los scaffolds aprobados. |
| Configuración | `tsconfig.json` usa `strict`, alias `@/*`, módulos con resolución `bundler` y `noEmit`. Vite integra React, Tailwind, alias `@`, URL base y plugins de Figma para metadatos, errores/HMR, stories y mapas de fuente. `.figma/make/` contiene scripts de instalación, formato, preview y publicación estática. | Mantener TypeScript estricto en A. Cada versión usará su propia compilación y configuración de documento. |
| `App` · `src/App.tsx` 394–408 | Compone `Header`, `Hero`, `Catalog`, `Guidance`, `Contact` y `Footer`. Guarda la categoría activa. El mismo archivo de 408 líneas reúne datos, iconos, lógica y presentación. | Conservar el orden y extraer componentes de sección, datos y lógica de interacción. |
| `Header` · 94–131 | Marca tipográfica con símbolo SVG, navegación adhesiva, carrito con contador decorativo, `Accedi` y menú compacto desplegable. | Conservar el patrón visual. Compartir destinos y acciones entre las variantes, añadir acceso claro a la búsqueda y resolver controles de demostración. |
| `Hero` · 133–178 | Fondo degradado, promesa de valor, dos CTA e ilustración decorativa SVG de dos piezas editoriales. | Conservar jerarquía, arte y CTA. Conectar el segundo CTA a `Formazione`. |
| `Card`, `Cover` e `Icon` · 23–85, 180–215 | Cards flexibles en lista, portada SVG de 400×240 con motivos geométricos, badge de tipo, categoría, formato, título/subtítulo, descripción, metadatos, ambos precios y CTA. Iconos SVG inline decorativos. | Reutilizar la composición, sacar las portadas y el arte del JSX, alimentar fichas desde JSON y dar una acción real al CTA. |
| `Catalog` · 218–275 | Campo de búsqueda controlado, botón de limpieza, pills con `aria-pressed`, contador con `role="status"`, grilla y estado vacío. | Conservar patrón visual y semántica base. Corregir normalización, nombres, resets, foco y presentación en pantallas estrechas. |
| `Guidance` · 277–302 | Bloque opcional `#guida` con tres tarjetas informativas. Es el destino de `Risorse`. | Conservar como sección estática mientras se mantenga el enlace `Risorse`. |
| `Contact` · 304–364 | Tres campos, errores inline y vista de confirmación con opción de reinicio. | Conservar el diseño a dos paneles, corregir validación Unicode, foco, estados accesibles y redacción de la demo. |
| `Footer` · 366–392 | Pie azul oscuro, marca, descripción, navegación repetida, copyright e iconos sociales. | Conservar la jerarquía del pie. Usar los mismos destinos funcionales que el header. |

`public/` solo aporta `favicon.png` y las reglas de atributos que lo eximen de Git LFS. Los `.webp` del JSON son rutas previstas. No hay archivos locales de producto, ilustración principal, marca independiente ni fuentes. `CLAUDE.md` remite al `AGENTS.md` de `Prueba/`, que describe un preview de Figma Make ya activo. Esa descripción no coincide con el estado del entorno auditado.

## 3. Sistema visual y comportamiento responsive

| Elemento | Evidencia en Figma Make | Propuesta para la paridad |
| --- | --- | --- |
| Color | Tokens de `src/index.css` en coincidencia con el contrato: marca `#1B4F8A`, texto `#0F2D52`, acento `#0EA5E9`, superficie `#FFFFFF`, fondo `#EFF6FF`, texto secundario `#64748B`, borde `#E2E8F0`, error `#B42318`, éxito `#15803D`. Footer `#0B2447`. | Mantener la paleta y los degradados de categoría. Usar colores accesibles específicos para texto secundario sobre azul claro, bordes de campos y foco. |
| Tipografía | Inter 400–800 vía Google Fonts, con fallback `system-ui, sans-serif`. H1 de 40/48/64 px, interlineado 1,05. H2 de 30/36 px. Texto introductorio de 18 px. | Usar la misma fuente, pesos y métricas en ambos stacks. Verificar que la importación actual carga y decidir el autoalojamiento compartido al revisar la procedencia. |
| Geometría | Contenedor de 1240 px; márgenes interiores de 20/32 px; separación de 24 px entre cards; card de 16 px; controles de 10 px. Sombra doble tenue y elevación al pasar el puntero. CTA de 44–48 px en general y búsqueda de 56 px. | Consolidar valores y estados en el contrato, incluyendo la tarjeta de altura uniforme, el pie de precio/CTA y el arte de proporción 5:3. |
| 375 px | Una columna de catálogo. Menú compacto, hero y contacto apilados. Pills en una fila con desplazamiento horizontal y scrollbar oculto. | Verificar reflujo y visibilidad de los filtros. Proponer pills con salto de línea si se confirma que el desplazamiento oculta opciones o recorta el foco. |
| 640–767 px | Los CTA del hero se disponen en fila y las pills pasan a varias líneas. `Accedi` aparece en la barra a partir de `sm` y, con el menú abierto, también dentro. | Mantener una sola instancia visible y enfocable de `Accedi` en cada configuración. |
| 768–1023 px | Dos columnas de catálogo; navegación completa desde `md`; `Guidance` pasa directamente a tres columnas. Hero y contacto siguen apilados. | Medir el ancho real del header a 768 px y el ajuste de textos en los tres bloques de guía. Fijar un mismo umbral en ambos stacks si el header necesita más espacio. |
| 1024 y 1280 px | Tres columnas de catálogo desde `lg`, hero y contacto a dos columnas, header de 72 px desde `md`. | Conservar tres columnas desde `lg`, incluido el punto de verificación de 1280 px, y comprobar cabida de títulos y del selector de apariencia. |

**Decisión responsive.** Usar desde la base un diseño mobile-first y la escala estándar `sm` 640, `md` 768, `lg` 1024, `xl` 1280 y `2xl` 1536 px, expresada en `rem` en el JSON. Next.js y Stylus resuelven los mismos umbrales. La grilla usa una columna en base, dos desde `md` y tres desde `lg`. 375, 768 y 1280 px son anchos de verificación. [Contrato de diseño](design-contract.md#responsive-mobile-first) · [Breakpoints de Tailwind](https://tailwindcss.com/docs/responsive-design).

**Decisión de apariencia.** [Los tokens canónicos](design-tokens.json) expresan primitivas, roles semánticos y alias de componentes. [Su proyección CSS](design-tokens.css) aporta las variables a Tailwind y Stylus. La misma inicialización en `<head>` resuelve `Chiaro`, `Scuro` o `Sistema` antes del primer pintado. El selector persiste la preferencia por origen, reacciona a cambios del SO en modo `Sistema` y conserva foco y estado de la landing. En ambos temas se comprobarán contraste y estados interactivos. [Contrato de apariencia](behavior-contract.md#appearance).

La hoja global incluye desplazamiento suave, margen de anclaje superior de 88 px, contorno `:focus-visible` y reducción de animaciones bajo `prefers-reduced-motion`. También aplica `overflow-x: hidden` al `body`, que puede ocultar contenido fuera del viewport durante una regresión. El estado final debe pasar la comprobación de reflujo con medición del ancho y revisión del contenido visible. Comparar también la altura del header abierto con el salto a una sección, el recorte del foco de las pills y el cambio de anchos durante el uso del teclado.

## 4. Matriz de cumplimiento

Los estados describen lo observado en código. El diseño renderizado, el comportamiento real de los controles y la conformidad WCAG quedan pendientes de validación en navegador.

| Requisito | Estado en `Prueba/` | Evidencia y trabajo pendiente |
| --- | --- | --- |
| Idioma italiano | Parcial | La interfaz es mayoritariamente italiana, con `home`, `Mobile` y `Footer` en nombres accesibles. `site.json` omite `language` y el plugin del shell usa `en` como fallback. El título también cae en `Figma Make App`. |
| Estructura de landing | Cumple en código | Header, hero, catálogo, guía, contacto y footer. Usa landmarks y un H1 con H2/H3 coherentes. Añadir un salto a `main`. |
| Ocho productos ficticios y categorías | Parcial | Ocho entradas, seis tests y dos cursos, con cuatro categorías y dos entradas por categoría. El array local replica los nombres, formatos, fechas e importes, con IDs numéricos, honoríficos, descripciones diferentes y precios ya formateados. Deben prevalecer los registros de `specs/products.json`. Añadir indicación de catálogo ficticio y revisar expresiones que sugieren eficacia real. |
| Ficha con imagen y metadatos | Parcial | SVG con nombre accesible, badge de tipo/formato, nombre completo repartido en dos niveles, autor/docente, edad/fecha y precios. El `dl` intercala elementos de icono entre `dt` y `dd`, y el rol de autor/docente solo aparece para lectores de pantalla. Normalizar el marcado y aplicar las etiquetas acordadas a partir del dato. |
| Precios italianos | Parcial | Los importes actuales coinciden con los ocho ejemplos. Son literales y no aplican el formato de forma general. Conservar los céntimos enteros, el precio anterior tachado, ambos nombres accesibles y el importe rebajado destacado. |
| Acción de ficha | Ausente | `Scopri di più` apunta al propio `#catalogo`. Se propone revelar una ficha ampliada con resumen de los datos canónicos en la misma página, con el estilo actual del CTA. |
| Búsqueda solo por nombre | Parcial | Intersección y búsqueda parcial correctas en código, con `trim` y minúsculas. Falta normalización Unicode de diacríticos. Para tests concatena nombre corto y subtítulo, omitiendo el separador «—» del nombre canónico. |
| Filtros y orden | Cumple en código | `Tutti` inicial y cuatro categorías con `aria-pressed`, intersección con la búsqueda y orden original. `Tutti` preserva la consulta. Falta confirmar alcance por teclado en la fila con scroll. |
| Resets, contador y vacío | Parcial | Hay reset de consulta y reset doble en el estado vacío. El reset doble usa `Reimposta ricerca e filtri`. Usar `Cancella filtri`, hacerlo encontrable con filtros activos y devolver el foco a un control estable al desaparecer un botón o el bloque vacío. El contador anuncia resultados en italiano. |
| Navegación y búsqueda en header | Parcial | `Formazione` cambia la categoría en header desktop y compacto. La CTA del hero y el footer solo desplazan; `Test` se comporta distinto entre header desktop y compacto. Falta el acceso a búsqueda en el header. `Accedi` apunta a un ID inexistente, carrito carece de acción y las redes apuntan a `#top`. |
| Rejilla y reflujo | Parcial | Las reglas dan 1, 2 y 3 columnas a 375, 768 y 1280 px. El reflujo, el header en anchos intermedios y la visibilidad de las pills se deben comprobar en navegador. |
| Formulario inválido | Parcial | Etiquetas persistentes, `aria-invalid`, `aria-describedby`, mensajes italianos y preservación de valores. Falta semántica `required` y foco en el primer error. `.length` mide unidades UTF-16 y puede aceptar un solo carácter suplementario como dos. |
| Formulario válido | Parcial | `preventDefault` y vista de éxito local. El título afirma que se envió un mensaje y el texto promete respuesta, aunque la nota indica que es una simulación. `Rispondiamo via email` también crea esa expectativa. Faltan un anuncio predecible y gestión del foco al reemplazar el formulario y al reiniciar. |
| Entregas A/B y README propios | Pendiente | El React/Vite original es una referencia. A y B deben usar sus stacks y documentarse por separado. |

### Prioridades de accesibilidad

- **Alta · Contraste de controles.** El acento `#0EA5E9` da 2,77:1 sobre blanco y 2,55:1 sobre `#EFF6FF`. El borde `#E2E8F0` da 1,23:1 sobre blanco. Revisar especialmente el contorno global y los campos con `focus:outline-none`, donde también se depende de bordes o anillos transparentes. Usar un borde y un foco diferenciados con contraste de al menos 3:1 donde identifiquen el control o su estado. El azul marca da 8,29:1 sobre blanco. Criterios 1.4.11 y 2.4.7. [WCAG 2.1](https://www.w3.org/TR/WCAG21/).
- **Alta · Idioma y formularios.** Establecer `lang="it"`, traducir nombres accesibles, declarar campos obligatorios y enfocar el primer inválido después de publicar los errores. Mantener una región de estado estable para anunciar `Richiesta simulata correttamente. Nessun messaggio è stato inviato.` y situar el foco en el panel de confirmación si se reemplaza el formulario. Al reiniciar, devolver el foco a `Nome`. Criterios 3.1.1, 3.3.1, 3.3.2 y 4.1.3. [WCAG 2.1](https://www.w3.org/TR/WCAG21/).
- **Alta · Destinos y teclado.** Usar enlaces para destinos existentes, un botón de menú con `aria-expanded` y `aria-controls` apuntando a un panel persistente que se oculta al cerrar. Permitir Escape y retorno al botón cuando corresponda. Al navegar desde el menú, llevar el foco al destino de manera equivalente. Evitar pasos de tabulación sin acción y revisar el orden tras `Cancella ricerca`. Criterios 2.1.1, 2.4.3, 2.4.4 y 4.1.2. [WCAG 2.1](https://www.w3.org/TR/WCAG21/).
- **Media · Texto, reflujo y contenido no textual.** `#64748B` sobre blanco da 4,76:1 y sobre `#EFF6FF` da 4,37:1. Validar el texto pequeño sobre fondos reales, incluidos fondos mezclados por opacidad, y oscurecerlo donde sea necesario. Revisar a 200 % y a 320 CSS px, comprobar foco sin recorte y usar un texto alternativo que describa el motivo de cada portada sin repetir el nombre entero. Los iconos junto a texto y el arte decorativo pueden quedar ocultos al lector de pantalla. Criterios 1.1.1, 1.4.3, 1.4.4 y 1.4.10. [WCAG 2.1](https://www.w3.org/TR/WCAG21/).

## 5. Arquitectura propuesta

```text
/
├── AGENTS.md
├── .agents/skills/
├── specs/
├── Prueba/
├── version-a/  # Next.js App Router + TypeScript estricto + Tailwind
└── version-b/  # Laravel + Blade + Stylus/BEM + jQuery + Gulp
```

Cada versión tendrá sus propias dependencias, lockfiles, comandos y README. Ambas servirán la landing y las ocho fichas iniciales en el HTML, con las operaciones dinámicas en el navegador. El estado de categoría y búsqueda será local a la página. El formulario tendrá un flujo exclusivamente local, sin persistir datos personales. La preparación del monorepo empaqueta por separado catálogo, tokens y recursos compartidos en cada build. Los despliegues serán independientes y usarán el mismo commit para la entrega evaluada.

### A · Next.js 14+ con App Router

- `app/layout.tsx` declara idioma, metadatos, tokens CSS y bootstrap de apariencia previo al pintado. `app/page.tsx` es un Server Component que obtiene el catálogo a través del lector de servidor y compone las secciones. Hero, guía y footer permanecen como composición de servidor. Se usará Tailwind 4 con utilidades que apuntan a los tokens compartidos.
- `components/layout/` y `components/sections/` reúnen secciones, fichas y controles. `types/` define el producto como unión discriminada `test`/`course`. `data/` valida datos y selecciona el lector por configuración. `lib/` aloja operaciones puras con nombre, precios, fechas y validación del formulario donde tengan más de un consumidor o necesiten prueba aislada.
- Delimitar `'use client'` al catálogo, al contacto, al menú, al selector de apariencia y a los controles que seleccionan una categoría desde otras secciones. Un proveedor pequeño puede coordinar los enlaces a `Formazione` con el catálogo. La consulta se mantiene en el catálogo. Los props serán serializables y se formatearán precios y fechas una vez, con configuración explícita, antes de hidratar.

### B · Laravel 9+ con Blade

- `routes/web.php` ofrece `GET /`. Un controlador de landing recibe el lector de catálogo y entrega un modelo de vista. Blade escapa los valores. El layout `resources/views/layouts/app.blade.php` aplica el mismo CSS y bootstrap temprano, con vistas de sección y un parcial reutilizable para fichas y otros elementos repetidos.
- `resources/stylus/` consume el CSS compartido y los breakpoints generados, y contiene base y estilos por componente BEM. Reservar clases como `.product-card__title` para presentación y atributos `data-*` para JS. Gulp compilará Stylus y preparará CSS y JS para `public/`, con tareas de desarrollo, watch y producción. jQuery se cargará una sola vez antes del script de la landing.
- `resources/js/` enlazará menú, navegación, búsqueda, filtros y contacto mediante jQuery y eventos acotados a cada bloque. Las fichas tendrán IDs y atributos de nombre canónico y categoría. El script actualizará `hidden`, `aria-pressed`, contador, foco y estado vacío sobre el HTML existente, evitando leer textos de presentación y evitando insertar la consulta como HTML. El formulario se habilitará al estar listo el manejador que cancela el envío, con ayuda en italiano si JS está desactivado.

### Reglas de interacción compartidas propuestas

- Usar `#catalogo`, `#guida` y `#contatti` en la navegación. `Formazione` en header, hero y footer selecciona esa categoría, mantiene la consulta y desplaza al catálogo. `Test` conduce al catálogo general y aplica el mismo comportamiento en todos sus accesos. `Cerca` en el header lleva al campo de búsqueda y le da foco. La selección inicial sigue siendo `Tutti`.
- Para `Accedi` conservar el lugar en la composición con un estado de demostración explícito. El carrito y los iconos sociales se tratarán como decisiones de fidelidad visual en la primera revisión. Una acción interactiva necesitará destino real o aviso explícito de demostración. Se propone una expansión semántica de detalles por ficha con `Scopri di più` para mantener el CTA y limitar la intervención al catálogo.
- Derivar las mismas entradas y el mismo orden de `specs/products.json`. Normalizar la consulta y `name` mediante `trim`, descomposición Unicode, minúsculas y eliminación de marcas combinantes. Mantener la búsqueda literal de subcadena sobre el nombre normalizado, incluida la puntuación del nombre canónico. Aplicar intersección con la categoría. Mantener `Cancella ricerca` y `Cancella filtri` con sus efectos respectivos, y dejar un foco válido después de ambos.
- Validar el valor recortado de `Nome` y `Messaggio` contando puntos de código Unicode en ambos clientes. Acordar una regla de email común, con aceptación de entradas válidas tras recortar espacios, y compartir ejemplos válidos e inválidos. Tras un intento inválido, mostrar los errores junto al campo y conservar los datos introducidos. Tras un intento válido, publicar el mismo mensaje de simulación y ofrecer reinicio local.

### Catálogo remoto y entrega

- Empezar con lectores JSON en servidor. Añadir después un lector Supabase Data API que devuelva los mismos DTO, preserve orden y tipos y use RLS de solo lectura. Los filtros, las fichas y el formulario permanecen en sus respectivas fronteras. El diseño de tablas, migraciones, seed y permisos está en la [arquitectura del catálogo](catalog-architecture.md).
- Integrar GitHub con Vercel para A y Railway para B en la etapa de entrega. Probar una primera publicación con JSON. Activar Supabase en ambas aplicaciones de forma coordinada después de comprobar DTO, seed y permisos. El contexto de build, la configuración y los criterios de promoción están en la [arquitectura de producción](deployment-architecture.md).

## 6. Datos, assets y decisiones de paridad

1. **Catálogo.** Se comprobó que el JSON tiene ocho IDs únicos y cuatro categorías de dos productos, con campos de edad/fecha según tipo, formatos admitidos e importes válidos. Conservar descripciones, nombres, autores e IDs del JSON. Si se mantiene el tratamiento corto/largo del título para los tests, dividir visualmente el nombre canónico por « — » y mantener un único encabezado accesible con el nombre completo. Usar un mapa acordado de etiquetas por categoría y texto alternativo italiano por ID. Documentar el significado de las etiquetas de autoría y docencia sin inferir honoríficos.
2. **Distribución.** Mantener `specs/products.json` como fuente editable. El paso de preparación del monorepo copiará el archivo a un recurso local de cada versión para el build y la distribución. Las copias serán generadas y verificables byte a byte, con el mismo paso documentado en los dos READMEs. Usar la misma estrategia para el arte generado una vez que se acuerde su ubicación compartida. Validar que las rutas referenciadas dentro del JSON existan en ambos `public/`.
3. **Imágenes.** Extraer la ilustración del hero y la geometría de las ocho portadas fuera de `Prueba/`. Exportar las portadas 5:3 a las rutas WebP previstas, preservando la correspondencia de motivos y colores entre las posiciones originales y los IDs canónicos. La ilustración, marca e iconos pueden servirse como SVG estáticos a partir del arte existente cuando se confirme su procedencia. Declarar dimensiones intrínsecas, reservar el espacio en ambos layouts y cargar de forma diferida las portadas bajo el pliegue. Revisar que las copias sean archivos reales en el build y no punteros de LFS.
4. **Fuente y contenido.** Usar el mismo archivo o proveedor de Inter, pesos y fallback. Registrar procedencia y licencia de fuente, marca e ilustraciones antes de distribuirlas. Conservar la jerarquía y el texto italiano útil de Figma Make. Ajustar las frases que atribuyen eficacia clínica o prometen respuesta y añadir información visible de catálogo ficticio.
5. **Localización.** Tratar las fechas de cursos como fechas civiles y conservar `15 marzo 2027` y `22 aprile 2027` en cualquier zona horaria. Para los importes usar dos decimales, coma decimal, punto de miles y el mismo espacio antes de `€`. Se verificó en Node 24.20.0 que `Intl.NumberFormat('it-IT')` en modo moneda predeterminado omite el punto en 1250. Con `useGrouping: 'always'` resulta `1.250,00 €`. La implementación PHP debe coincidir también en el espacio no separable y se comprobará con los mismos ejemplos.

## 7. Riesgos técnicos

| Prioridad | Riesgo | Control y evidencia esperada |
| --- | --- | --- |
| P0 | Fidelidad del tema claro y paridad del oscuro sin capturas del prototipo. | Usar Figma Make para el tema claro y revisar el oscuro en A y B. Capturar la referencia cuando haya preview y registrar diferencias deliberadas. |
| P0 | El entorno actual no ejecuta el prototipo. El ancho con menú, reflujo, tipografía, foco y arte final siguen sin observarse. | Obtener capturas desde un preview existente o con las dependencias ya disponibles en una copia de trabajo autorizada. Mientras tanto los valores del contrato se marcan como extraídos del código. |
| P0 | Búsqueda, etiquetas y formato discrepan por duplicación de datos y diferencias entre stacks. | Distribución derivada del JSON, casos de prueba compartidos y comparación de HTML inicial, resultados, fechas y precios. |
| P0 | Contraste bajo y pérdida de foco al cerrar paneles, cambiar el catálogo o alternar el formulario. | Especificar el manejo de foco y verificar todos los estados por teclado y con lector de pantalla, en particular el menú móvil y las pills. |
| P1 | Dependencia de Google Fonts o rasterización de portadas con estilos distintos. Posibles recursos ausentes al desplegar. | Revisar fuente y procedencia, usar los mismos binarios y validar rutas, tamaños, fallback y rendimiento en los builds de producción. |
| P0 | Destello de tema, divergencia de breakpoints o pérdida de preferencia. | Verificar proyección común, primer pintado antes de hidratar, almacenamiento bloqueado, cambios del SO y paridad a ambos lados de los puntos de corte. |
| P0 | Diferencias de datos al activar Supabase o exposición de filas no publicadas. | Validar DTO y orden con seed, RLS de lectura con la clave publicable y cambio coordinado de la fuente. |
| P0 | Builds productivos sin acceso a tokens compartidos o activos públicos incorrectos. | Verificar contextos Vercel y Railway, lockfiles, scripts, servidor de producción y `public/` en un entorno limpio. PHP y Composer no aparecieron en el `PATH` auditado. |

## 8. Plan priorizado y Skills

| Orden | Prioridad y etapa | Resultado verificable | Skills |
| --- | --- | --- | --- |
| 1 | P0 · Consolidar contrato visual | Referencia Figma Make, ambos temas, escala responsive, tokens y estados documentados. Capturas de 375/768/1280 px cuando el preview esté disponible. Decisiones sobre navegación demo, fichas, idioma y contraste. | `design-system`, `accessibility-expert`, `quality-assurance` |
| 2 | P0 · Preparar assets, tokens y datos | Mapa de ocho portadas, hero, fuente e iconos, tamaños y textos alternativos. Procedencia registrada y preparación reproducible de tokens, JSON y assets. | `design-system`, `catalog-interactions` |
| 3 | P0 · Crear arquitectura Next.js | App Router, TypeScript estricto, Tailwind 4, lector JSON de servidor y layout italiano con bootstrap temprano y tokens compartidos. | `nextjs-engineer`, `catalog-interactions`, `design-system` |
| 4 | P0 · Construir secciones en A | Header, hero, catálogo, guía, contacto y pie con componentes tipados; ocho cards canónicas. | `nextjs-engineer`, `design-system` |
| 5 | P0 · Implementar interacciones en A | Búsqueda y filtros combinables, resets, contador/vacío, navegación operable, selector `Aspetto` persistente y formulario de demostración. | `catalog-interactions`, `nextjs-engineer`, `design-system`, `accessibility-expert` |
| 6 | P0 · Ajustar responsive en A | Rejillas, navegación, layout de hero y contacto, cabida de filtros y títulos en anchos finales e intermedios. | `design-system`, `nextjs-engineer`, `quality-assurance` |
| 7 | P0 · Validar accesibilidad en A | Verificar teclado, anuncios, contraste, foco, idioma y reflujo antes de replicar decisiones en B. | `accessibility-expert`, `quality-assurance` |
| 8 | P0 · Crear arquitectura Laravel | Ruta, controlador con lector JSON, layouts/partials y compilación Gulp de los estilos y scripts, con lockfiles propios. | `laravel-engineer`, `catalog-interactions`, `design-system` |
| 9 | P0 · Reproducir diseño e interacciones en B | HTML inicial y estados iguales a A, tokens y BEM, bootstrap común y jQuery para controles, búsqueda, filtros y formulario. | `laravel-engineer`, `design-system`, `catalog-interactions`, `accessibility-expert` |
| 10 | P0 · Comparar paridad | Capturas de referencia cuando estén disponibles, A y B en ambos temas y los mismos anchos y estados. Misma matriz funcional y de accesibilidad. | `quality-assurance`, `design-system`, `accessibility-expert` |
| 11 | P0 · Validar compilación y calidad | Typecheck, lint y producción en A. Rutas, pruebas PHP pertinentes y build Gulp en B. Inspección de consola, red, recursos y carga. | `quality-assurance`, `nextjs-engineer`, `laravel-engineer` |
| 12 | P0 · Publicar ambas versiones con JSON | GitHub CI, Vercel y Railway sobre la revisión acordada, dos URLs públicas HTTPS y smoke test de la entrega inicial. | `delivery-engineer`, `quality-assurance` |
| 13 | P0 · Habilitar Supabase | Migraciones y seed versionados, RLS probada con `anon`, equivalencia de ambos lectores con el JSON y activación coordinada en producción. | `supabase-architect`, `catalog-interactions`, `quality-assurance`, `delivery-engineer` |
| 14 | P0 · Cerrar documentación de entrega | READMEs A/B y enlaces raíz, versiones reales, comandos, fuente activa, URLs verificadas y evidencia en `QA-REPORT.md`. | `delivery-engineer`, `quality-assurance` |

## 9. Criterios de aceptación

| Área | Prueba verificable en ambas versiones |
| --- | --- |
| Arranque e idioma | Abrir `/` y comprobar `lang="it"`, textos y nombres accesibles italianos, H1 único y secciones presentes. Confirmar acceso al contenido principal por teclado y ocho cards en el HTML inicial. |
| Datos y fichas | Comparar IDs, orden, metadatos y formatos con JSON. Comprobar dos fichas por categoría, imágenes válidas, nombre completo, etiquetas de autor/docente, edad/fecha, dos precios y destino real o demo explícita en las ocho acciones. Caso de formato `125000` céntimos → `1.250,00 €`. |
| Descubrimiento | Inicialmente 8 y `Tutti` activo. `  Equilíbria  ` da 1 con la categoría clínica y 0 con `Formazione`. `Moretti` da 0 por buscar solo nombres. `Tutti` conserva la consulta y `Cancella ricerca` conserva la categoría. `Cancella filtri` devuelve 8 y vacía la consulta. Verificar orden, conteo, anuncio del vacío, foco tras reset y ausencia de recarga. |
| Navegación y teclado | Recorrer con Tab, Shift+Tab, Enter y Espacio según semántica. Abrir/cerrar menú con Escape, comprobar foco y `aria-expanded`. Usar cada acceso a `Formazione`, `Risorse`, `Contatti` y búsqueda. Cada destino y el foco son identificables con el header adhesivo. |
| Contacto inválido | Enviar vacío y verificar mensajes asociados y foco en `Nome`. Probar `Nome` de un punto de código suplementario, email `utente@` y mensajes de menos de 10 puntos de código tras recortar. En intentos separados verificar el foco en el primer campo inválido y la preservación de los valores. |
| Contacto válido | Enviar datos válidos, incluidas longitudes mínimas exactas tras recortar. Verificar la confirmación italiana con aviso de simulación, anuncio y foco. Confirmar en la pestaña de red que no sale petición de formulario. Reiniciar y verificar valores vacíos y foco en `Nome`. |
| Responsive y paridad visual | Capturar claro y oscuro a 375, 768 y 1280 px con las mismas condiciones y verificar 1/2/3 columnas. Inspeccionar límites de breakpoints, 320 CSS px y 200 % de zoom. Comparar fuente, espaciado, imágenes, títulos, menú abierto, vacío, errores y éxito. Comprobar ausencia de contenido cortado y de scroll horizontal. |
| Apariencia | Probar `Chiaro`, `Scuro` y `Sistema` por teclado, con recarga y persistencia por origen. Probar cambios del SO en `Sistema` y con anulación manual, almacenamiento bloqueado o inválido, sincronización entre pestañas y fallback CSS sin JS. Con JS lento, verificar primer pintado con `Scuro` guardado sobre SO claro y el caso inverso. Revisar hidratación, foco y conservación de datos de la landing. |
| Accesibilidad y rendimiento | Medir contraste de los estados reales de los dos temas, recorrer con teclado y lector de pantalla, verificar reducción de movimiento. Revisar consola y recursos, dimensiones de imágenes y layout. Registrar resultados automatizados y comprobaciones manuales. |
| Fuentes de catálogo | Iniciar y compilar ambas versiones en modo JSON sin credenciales. Probar las migraciones, el seed idempotente y la igualdad de orden y DTO en Supabase. Como `anon`, comprobar lectura publicada, exclusión de borradores y denegación de escritura. Verificar tratamiento de error remoto y retorno explícito a JSON. |
| Entrega reproducible | En A ejecutar lint, `tsc --noEmit` y build. En B compilar assets con Gulp, comprobar `php artisan route:list`, pruebas pertinentes y render productivo. Probar lockfiles y preparación común en un checkout limpio, y registrar resultados y comandos en el reporte. |
| Producción obligatoria | Abrir las dos URLs públicas HTTPS de Vercel y Railway sin sesión. Asociar ambas al SHA evaluado, comprobar carga, recursos, búsqueda, filtros, formulario local y apariencia. Registrar las URLs, la fuente activa y las evidencias. Repetir tras activar Supabase en los dos servicios. |

**Primera tarea tras revisar el plan.** Preparar la generación compartida de tokens y las entradas de datos, e inicializar A con el lector JSON y el layout con apariencia previa al pintado. Afinar arte, contraste renderizado y navegación de demostración durante la implementación. Capturar el prototipo en cuanto haya un preview accesible. El arranque local de A es independiente del aprovisionamiento de servicios.
