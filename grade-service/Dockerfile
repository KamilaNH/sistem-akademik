FROM php:8.2-cli

# install sqlite3 dulu sebelum install extension php
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

COPY . .

EXPOSE 3004

CMD ["php", "-S", "0.0.0.0:3004", "index.php"]