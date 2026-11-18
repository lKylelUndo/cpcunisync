FROM php:8.5-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip ca-certificates default-mysql-client \
    && docker-php-ext-install pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --no-scripts

COPY . .

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 0777 storage bootstrap/cache \
    && composer dump-autoload --optimize \
    && php artisan package:discover --ansi

ENV PORT=10000
EXPOSE 10000

CMD ["sh", "-c", "php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=${PORT}"]
