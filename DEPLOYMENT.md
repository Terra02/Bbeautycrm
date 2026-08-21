# Деплой Beauty CRM

Этот проект можно вывести в открытый доступ двумя основными способами:

1. VPS: свой сервер, Docker, PostgreSQL, reverse proxy и домен.
2. PaaS: Render, Railway, Fly.io или похожий сервис.

Для этой CRM самый понятный и контролируемый путь - VPS. База PostgreSQL уже описана через Docker Compose.

## Что нужно купить или подготовить

- Домен, например `beauty-crm.ru`.
- VPS на Ubuntu 24.04 или Debian 12.
- Доступ по SSH к серверу.
- Docker и Docker Compose на сервере.
- Node.js LTS на сервере.

## Как будет работать продакшен

Пользователь открывает:

```txt
https://your-domain.ru
```

Запрос идет так:

```txt
Internet -> Caddy/Nginx HTTPS -> SvelteKit app -> PostgreSQL
```

PostgreSQL не должен быть открыт в интернет. Его порт должен быть доступен только внутри сервера.

## Минимальный сценарий на сервере

1. Скопировать проект на сервер.

2. Создать `.env`:

```sh
cp .env.example .env
```

3. В `.env` заменить:

```env
POSTGRES_PASSWORD="long-random-password"
DATABASE_URL="postgres://beauty_crm:long-random-password@localhost:5433/beauty_crm"
BETTER_AUTH_SECRET="long-random-secret-at-least-32-chars"
BETTER_AUTH_URL="https://your-domain.ru"
ADMIN_EMAIL="your@email.com"
ADMIN_PASSWORD="long-admin-password"
ADMIN_NAME="Администратор"
```

4. Поднять базу:

```sh
docker compose up -d postgres
```

5. Применить миграции:

```sh
npm ci
npm run db:migrate
npm run seed:admin
```

6. Собрать приложение:

```sh
npm run build
```

7. Запустить приложение:

```sh
npm run start
```

Проект уже использует `@sveltejs/adapter-node`, поэтому production-сборка лежит в папке `build`.

## HTTPS и домен

Самый простой reverse proxy для новичка - Caddy. Он умеет автоматически получать HTTPS-сертификаты, если домен указывает на сервер и открыты порты `80` и `443`.

Пример Caddyfile:

```txt
your-domain.ru {
	reverse_proxy 127.0.0.1:3000
}
```

## Что делать при обновлении сайта

Обычно процесс такой:

```sh
git pull
npm ci
npm run db:migrate
npm run build
pm2 restart beauty-crm
```

Если приложение будет завернуто в Docker, тогда вместо `pm2` будет:

```sh
docker compose build web
docker compose up -d web
```

## Обязательная безопасность

- Не использовать пароли из `.env.example`.
- Не открывать PostgreSQL наружу.
- Хранить `.env` только на сервере, не коммитить его в git.
- Делать backup PostgreSQL.
- Использовать HTTPS.
- Создать отдельного администратора и не использовать простой пароль.
