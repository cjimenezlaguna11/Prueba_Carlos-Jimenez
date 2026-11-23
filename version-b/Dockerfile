FROM node:24.20.0-bookworm-slim@sha256:ba849c60be29959425b8734d57b8b4b7d56f98edd9504c9af091d5281095a71e AS assets
WORKDIR /source/version-b
COPY version-b/package.json version-b/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY version-b/gulpfile.js ./
COPY version-b/resources/ ./resources/
COPY specs/design-tokens.json specs/design-tokens.css specs/products.json /source/specs/
COPY assets/catalog/ /source/assets/catalog/
COPY version-a/public/giunti-psychometrics.png /source/version-a/public/
RUN npm run build

FROM composer:2.11.2@sha256:50ea4d33fdcde1adb0f045547295faa1548b33872e5f789dae5b02ce2fb5de93 AS composer

FROM php:8.4.28-apache-bookworm@sha256:530fe79ff4c2737a4de714a7b1e6c741dbdb3dafcee0ce49a2b4993ca11ad7dd AS php-base
RUN apt-get update && apt-get install -y --no-install-recommends libicu-dev && \
    docker-php-ext-install intl && rm -rf /var/lib/apt/lists/*
WORKDIR /var/www/html

FROM php-base AS dependencies
COPY --from=composer /usr/bin/composer /usr/local/bin/composer
RUN apt-get update && apt-get install -y --no-install-recommends unzip && rm -rf /var/lib/apt/lists/*
COPY version-b/composer.json version-b/composer.lock ./
COPY version-b/app/ ./app/
RUN composer install --no-dev --no-interaction --prefer-dist --classmap-authoritative && \
    composer check-platform-reqs --no-dev

FROM php-base AS production
ENV APP_ENV=production APP_DEBUG=false APP_LOCALE=it LOG_CHANNEL=stderr SESSION_DRIVER=array CACHE_STORE=array CATALOG_SOURCE=json PORT=8080
COPY version-b/app/ ./app/
COPY version-b/artisan version-b/composer.json ./
COPY version-b/bootstrap/ ./bootstrap/
COPY version-b/config/ ./config/
COPY version-b/routes/ ./routes/
COPY version-b/resources/views/ ./resources/views/
COPY version-b/storage/ ./storage/
COPY version-b/public/index.php ./public/
COPY --from=dependencies /var/www/html/vendor ./vendor/
COPY --from=assets /source/version-b/public/ ./public/
COPY --from=assets /source/version-b/build/ ./build/
COPY version-b/docker/site.conf /etc/apache2/sites-available/000-default.conf
RUN printf 'Listen ${PORT}\n' > /etc/apache2/ports.conf && \
    a2dismod mpm_event mpm_worker && a2enmod mpm_prefork rewrite && \
    mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache && \
    apache2ctl configtest
EXPOSE 8080
RUN php artisan view:cache --no-ansi
CMD ["sh", "-c", "a2dismod mpm_event mpm_worker && a2enmod mpm_prefork rewrite && apache2ctl configtest && php artisan optimize --no-ansi && exec apache2-foreground"]
