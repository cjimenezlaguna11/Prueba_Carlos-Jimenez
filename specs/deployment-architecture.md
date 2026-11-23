# Arquitectura de producción

## Entrega mediante GitHub

El monorepo tendrá dos despliegues productivos del mismo repositorio GitHub y de la rama `main`. GitHub ejecutará comprobaciones de PR para los dos stacks y los artefactos compartidos, con un build limpio reproducible antes de promover una revisión. Vercel y Railway se conectarán independientemente al repositorio. La verificación de la entrega asociará ambas URLs HTTPS y el SHA probado en `QA-REPORT.md`. Los sitios deben abrir sin autenticación y conservar la paridad. La visibilidad del repositorio GitHub es una decisión aparte.

Fijar versiones compatibles de Node, gestor JS, PHP y Composer en la configuración de cada stack, con lockfiles propios y comandos de instalación congelada. Para el Dockerfile, fijar también la versión de cada imagen base. Usar los mismos pasos en local, CI y el proveedor. Un paso de preparación en la raíz, ejecutable con Node y sin dependencias nuevas del repositorio raíz, toma el JSON de catálogo, los tokens y el arte compartido y produce entradas locales de build. Genera o verifica la proyección CSS, los adaptadores de breakpoint y las copias de datos/assets que cada app empaqueta. CI verifica el contrato y la generación determinista. Ambos builds deben funcionar con el catálogo local y sin acceder a Supabase.

## A · Vercel

- Importar el repositorio con preset Next.js, **Root Directory** `version-a` y acceso a fuentes externas a ese directorio durante el build. El comando de build de A ejecuta la preparación compartida desde la raíz y después `next build`. El artefacto conserva los recursos necesarios dentro de A. Verificar que cambios en `specs/` y los recursos compartidos también disparen builds. Usar el runtime de Next.js en Vercel para admitir lecturas de catálogo en servidor. [Monorepos en Vercel](https://vercel.com/docs/monorepos/monorepo-faq).
- Separar configuración de Development, Preview y Production. Los builds de CI y previews iniciales usan `CATALOG_SOURCE=json`. La promoción a producción debe dejar la URL HTTPS accesible sin protección de despliegue para el evaluador. Validar en esa URL la apariencia antes de hidratar, assets y recorrido completo.

## B · Railway

- Conectar `main` del mismo repositorio a un servicio `version-b` con **Root Directory** `/` y `RAILWAY_DOCKERFILE_PATH=/version-b/Dockerfile`. Railway restringe el checkout al directorio configurado. La raíz del monorepo permite que el builder lea `specs/`, `assets/catalog/` y el logo en `version-a/public/giunti-psychometrics.png`. Vigilar cambios en esas entradas y en `version-b/`. `version-b/Dockerfile.dockerignore` limita el contexto a las entradas necesarias. [Monorepos en Railway](https://docs.railway.com/deployments/monorepo) · [Dockerfiles en Railway](https://docs.railway.com/builds/dockerfiles).
- El Dockerfile compila Stylus y JS con Node/Gulp, instala PHP con Composer en una etapa separada y sirve Laravel con PHP 8.4 y Apache. El webroot es `public/` y Apache escucha en `$PORT`. La imagen incluye `vendor/`, los recursos compilados y el catálogo preparado. Las cachés se generan al iniciar con las variables de producción suministradas por Railway. Los directorios `storage/` y `bootstrap/cache/` admiten escritura.
- Inyectar `APP_ENV=production`, `APP_DEBUG=false`, `APP_KEY` única y estable, `APP_URL` con la URL HTTPS y `CATALOG_SOURCE`. Configurar sesión y caché sin dependencia de una base de Laravel para esta landing. Gestionar `PORT` desde Railway y revisar la configuración de proxies de confianza para generar URLs HTTPS. Publicar el dominio de Railway con TLS y configurar un health check HTTP del servicio. Verificar aparte que `/` sirve las ocho fichas y los recursos. [Despliegue de Laravel en Railway](https://railway.com/guides/laravel) · [Red pública en Railway](https://docs.railway.com/networking/public-networking).

## Cierre de la entrega

1. Validar ambos builds sin Supabase y publicar las dos URLs de producción con JSON como primer hito. Probar en ventana privada el acceso, HTTPS, búsqueda, filtros, formulario, recursos y paridad de apariencia. Registrar el SHA, URLs y evidencia en los README de cada versión y en el reporte.
2. En la fase Supabase, aplicar y verificar las migraciones y el seed y configurar las dos aplicaciones con el mismo origen de datos. Usar un entorno de prueba antes de cambiar Production. Activar `CATALOG_SOURCE=supabase` de forma coordinada una vez que los DTO y RLS pasen las pruebas. Repetir las comprobaciones de paridad en ambas URLs. La primera publicación con JSON preserva la evaluación de la landing y permite preparar el cambio de fuente de forma independiente. El entorno productivo objetivo usa Supabase compartido. [Arquitectura del catálogo](catalog-architecture.md).
3. Si la activación remota falla, volver a `json` en ambos servicios o recuperar la última revisión válida, y repetir el smoke test. Registrar el origen activo y el resultado reales. No ejecutar migraciones de base de datos desde el build de un frontend ni al arrancar Laravel.

Los resultados de publicación y verificación se registran en [QA-REPORT.md](../QA-REPORT.md).
