# Giunti Psychometrics · Versione B

Landing dimostrativa en italiano para un catálogo profesional ficticio. La referencia de diseño y comportamiento es [la versión Next.js en producción](https://prueba-carlos-jimenez-version-a.vercel.app). Los datos, los tokens y el arte se preparan localmente desde este monorepo.

## Stack y requisitos

La verificación utilizó Laravel **13.43.0**, PHP **8.4.28**, Composer **2.11.2**, Node.js **24.20.0**, npm **11.6.1**, Gulp **5.0.1**, Stylus **0.64.0**, jQuery **3.7.1** e Inter Variable **5.3.0**. Usar PHP 8.4 con Intl y las extensiones exigidas por Composer y Laravel, Node 24 y los lockfiles del proyecto. Chrome se usa para la suite de navegador.

## Instalación y ejecución local

Ejecuta estos comandos desde el monorepo.

```sh
cd version-b
composer install
npm ci
npm run build
```

Copia `.env.example` a `.env` y ejecuta estos comandos.

```sh
php artisan key:generate
php artisan serve --host=127.0.0.1 --port=8100
```

Abre `http://127.0.0.1:8100`. Si cambias estilos, JavaScript o entradas compartidas, `npm run watch` recompila los recursos. El build crea `public/build/`, `public/images/` y `build/products.json`.

## Arquitectura

| Ruta | Responsabilidad |
| --- | --- |
| `app/Catalog/` | Lectura y validación del DTO canónico, importes en céntimos y fechas civiles. |
| `app/Http/Controllers/` | Composición de la vista y manejo de datos no disponibles. |
| `resources/views/` | Layout base, secciones Blade y componentes reutilizables. |
| `resources/stylus/` | Bloques BEM, propiedades de los tokens compartidos y media queries con breakpoints del JSON. |
| `resources/js/` | Eventos jQuery y lógica del catálogo, formulario, navegación y carrito. |
| `gulpfile.js` | Preparación de datos, recursos e Inter, compilación y minificación de CSS y JavaScript. |
| `tests/` | Integridad del DTO, rutas, pruebas de lógica y comparación con Next.js en Chrome. |

El lector usa `CATALOG_SOURCE=json` por defecto. Blade recibe el mismo DTO definido para Next.js. Una fuente no disponible conserva el resto de la landing y muestra un aviso en italiano. La integración con Supabase queda para una fase posterior.

El tema inicial se resuelve en un script de cabecera. `Sistema` sigue los cambios del sistema operativo, `Chiaro` y `Scuro` anulan esa preferencia, y `giunti.appearance.v1` sincroniza la selección entre pestañas. El carrito guarda solo IDs y cantidades en `giunti.cart.v1`, con subtotal calculado sobre el precio con descuento y un diálogo modal nativo. Ambos almacenamientos tienen un fallback en memoria. El carrito y el formulario son demostrativos, y los iconos sociales reproducen los marcadores de la versión A.

## Pruebas y paridad

```sh
php artisan route:list
php tests/catalog.php
npm test
npm run test:browser
```

La suite abre Next.js en el dominio público y Laravel local en el puerto 8100. Define `APP_A_URL` o `APP_B_URL` para usar otras instancias. `CHROME_PATH` permite seleccionar un ejecutable. Las capturas, diferencias y `metrics.json` se guardan en `test-results/parity/` o en `SCREENSHOT_DIR`. El informe de QA documenta la evidencia y el alcance de las pruebas. Las portadas usan el mismo WebP original. Next.js puede recomprimir sus imágenes en función del viewport. [Informe de QA](../QA-REPORT.md)

## Preparación de Railway

El contexto Docker es la raíz del monorepo. Railway limita el checkout al Root Directory configurado. El valor `/` conserva las entradas compartidas que el Dockerfile lee desde `specs/`, `assets/catalog/` y `version-a/public/`. Las etapas del Dockerfile compilan los recursos con Gulp, instalan las dependencias PHP desde el lockfile de Composer y sirven `version-b/public/` con Apache y PHP.

```sh
docker build -f version-b/Dockerfile -t giunti-version-b .
docker run --rm -p 8100:8080 --env-file version-b/.env -e APP_ENV=production -e APP_DEBUG=false -e PORT=8080 giunti-version-b
```

Cuando se apruebe el despliegue, configurar `RAILWAY_DOCKERFILE_PATH=/version-b/Dockerfile`, raíz `/`, rama `main` y health check `/up`. Definir `APP_ENV=production`, `APP_DEBUG=false`, una `APP_KEY` generada y estable, `APP_URL` con el dominio HTTPS y `CATALOG_SOURCE=json`. Railway inyecta `PORT`. Vigilar cambios en `version-b/`, `specs/`, `assets/catalog/` y el logo oficial en `version-a/public/giunti-psychometrics.png`. Los valores de sesión y caché por defecto para la imagen son `array`. [Arquitectura de despliegue](../specs/deployment-architecture.md).
