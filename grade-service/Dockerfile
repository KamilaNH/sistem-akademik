FROM php:8.2-cli

RUN docker-php-ext-install pdo pdo_sqlite

WORKDIR /var/www

COPY . .

EXPOSE 3004

CMD ["php", "-S", "0.0.0.0:3004", "index.php"]