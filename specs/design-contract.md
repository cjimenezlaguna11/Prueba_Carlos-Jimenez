# Contrato de diseño compartido

## Referencia y gobierno

`version-a/` y su despliegue en Vercel son la referencia visual, funcional y de experiencia consolidada para `version-b/`, en ambos temas. Mantener composición, jerarquía, proporciones, tipografía Inter, recursos, estados y comportamiento de la versión A. El prototipo de Figma Make se conserva como antecedente del proyecto.

## Tokens y consumo

[design-tokens.json](design-tokens.json) es la única fuente editable de valores compartidos. [design-tokens.css](design-tokens.css) es su proyección de referencia para navegador. Los alias en JSON usan referencias entre llaves y se deben validar por destino, tipo y ausencia de ciclos. Las variantes clara y oscura tienen las mismas claves semánticas.

| Nivel | Contenido | Consumo |
| --- | --- | --- |
| `primitives` | Paleta, tipografía, pesos, escala de espacios, radios, elevaciones, tamaños, duración y breakpoints. | Base de los demás tokens. Las claves que se usen directamente se exponen como `--ds-base-*`. |
| `semantic.shared` y `semantic.light/dark` | Contrato de superficies, texto, bordes, interacción, foco, error, éxito, pie y elevación, con espaciado y geometría común. | Propiedades `--ds-*`. El tema cambia su valor y conserva los nombres. |
| `components` | Alias del header, hero, botones, campo, búsqueda, pill, selector, card, badge, precios, feedback y footer. | Propiedades como `--ds-card-bg`, `--ds-pill-selected-bg` y `--ds-input-invalid`. Guía y contador reutilizan los roles de superficie y texto. |

- La futura preparación del monorepo regenerará el CSS de forma determinista y verificará cambios en CI. Next.js importará ese CSS y usará Tailwind 4 con `@theme inline` para asociar utilidades a `var(--ds-…)` y generar las variantes de breakpoint desde el JSON. Stylus importará los mismos tokens CSS y usará `var(--ds-…)` desde las clases BEM. Gulp recibirá un mapa Stylus de breakpoints generado desde el JSON. El adaptador de framework contiene nombres y referencias, con los valores en el JSON. [Variables de tema de Tailwind](https://tailwindcss.com/docs/theme).
- Los breakpoints se compilan a valores `rem` para las consultas de medios. Las Custom Properties sirven para declaraciones de estilo y se resuelven en tiempo de ejecución. Los archivos generados y los datos canónicos se empaquetan en cada build con el paso de preparación descrito en [el contrato de despliegue](deployment-architecture.md).
- Aplicar el mismo CSS temprano en ambos documentos. `:root` resuelve claro y `:root[data-theme="dark"]` resuelve oscuro. Una media query oscura cubre la ausencia de `data-theme`, incluidos los documentos con JS desactivado. Cada variante declara su `color-scheme` para controles nativos. El documento y su fondo deben tener el color de tema desde el primer pintado. La precedencia y persistencia se definen en [el contrato de comportamiento](behavior-contract.md#appearance).

## Responsive mobile-first

| Variante | Umbral CSS | Equivalencia habitual | Catálogo |
| --- | --- | --- | --- |
| Base | Inferior a `sm` | Menos de 640 px | Una columna |
| `sm` | 40 rem | 640 px | Una columna |
| `md` | 48 rem | 768 px | Dos columnas |
| `lg` | 64 rem | 1024 px | Tres columnas |
| `xl` | 80 rem | 1280 px | Tres columnas |
| `2xl` | 96 rem | 1536 px | Tres columnas |

Ambos stacks consumen la misma escala. Hero y contacto pasan de apilados a dos columnas en `lg`. Mantener el contenedor máximo y los márgenes de los tokens. Usar navegación compacta en la base y comprobar cabida del menú completo desde `md` con el selector de apariencia. Si no cabe sin recortar o duplicar controles, mover el menú completo a `lg` de forma coordinada. A 375, 768 y 1280 px se verifica 1/2/3 columnas. Revisar también los límites de las variantes, 320 CSS px y 200 % de zoom. [Breakpoints de Tailwind](https://tailwindcss.com/docs/responsive-design).

## Componentes y estados

Header con marca, navegación, búsqueda, apariencia y `Accedi` → hero con CTA → catálogo con búsqueda, categorías, contador, grilla y vacío → guía profesional → formulario → footer.

| Superficie | Estados y roles que deben probarse en claro y oscuro |
| --- | --- |
| Header y menú | Fondo sólido legible sobre el contenido adhesivo, borde, enlaces default/hover/active/focus, apertura y cierre, un selector visible y accesible por viewport. Marca e iconos con contraste sobre ambas superficies. |
| Hero y guía | Gradiente, texto secundario, arte decorativo, CTA primario y secundario default/hover/active/focus. Mantener legibilidad donde se combinan superficies con transparencias. |
| Búsqueda, pills y selector | Contornos de campo visibles, placeholder, hover, focus, clear, opción seleccionada con indicación semántica y visual, disabled cuando proceda. Apariencia como grupo de radios nativos, con iconos y etiquetas accesibles. |
| Catálogo, fichas y precios | Superficie y borde de card, elevación hover, foco del CTA, badge de formato, precio anterior tachado y precio actual, contador y vacío legibles. Mantener portadas 5:3 con espacio reservado. |
| Contacto | Campos default/hover/focus/invalid/disabled y confirmación simulada. Error y éxito con texto e icono cuando proceda. El foco se distingue también sobre un campo inválido. |
| Footer | Superficie, borde y enlaces con sus propios roles de contraste, hover y contorno de foco. |

Usar al menos 4,5:1 para texto normal y 3:1 para texto grande y para límites o indicadores significativos de controles cuando corresponda. El acento claro se reserva para decoración o usos comprobados. Verificar contraste sobre fondos compuestos, con foco, selección y error. Aplicar señales adicionales al color, objetivos táctiles de 44 px donde sea posible y respetar movimiento reducido. No animar el cambio inicial de tema. [WCAG 2.1](https://www.w3.org/TR/WCAG21/).

## Paridad

Comparar A y B con la misma fuente, arte, datos, copias, tamaños, preferencias y estados. Capturar claro y oscuro en 375, 768 y 1280 px, y probar `Sistema` con las dos configuraciones del SO. Registrar las diferencias y la evidencia de las pruebas.
