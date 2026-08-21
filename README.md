# Beauty CRM

CRM для салона красоты на SvelteKit, PostgreSQL, Drizzle ORM и Better Auth.

## Локальный запуск с базой

1. Создайте `.env` из примера:

```sh
copy .env.example .env
```

2. В `.env` замените `BETTER_AUTH_SECRET` и `ADMIN_PASSWORD`.

3. Поднимите PostgreSQL:

```sh
docker compose up -d postgres
```

Docker сам создаст базу `beauty_crm`, пользователя `beauty_crm` и пароль из `.env`.

Если до этого контейнер PostgreSQL уже запускался и появилась ошибка про PostgreSQL 18 и `/var/lib/postgresql/data`, удалите старый локальный volume и запустите базу заново:

```sh
docker compose down -v
docker compose up -d postgres
```

Эту команду безопасно выполнять только пока в базе нет нужных данных.

4. Примените миграции:

```sh
npm run db:migrate
```

5. Создайте первого администратора:

```sh
npm run seed:admin
```

6. Запустите сайт:

```sh
npm run dev
```

Откройте `http://localhost:5173/login` и войдите под `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Как переносить на сервер

Минимальный путь:

1. Установить на сервер Docker и Node.js.
2. Скопировать проект на сервер.
3. Создать серверный `.env` с сильными паролями и секретом.
4. Запустить PostgreSQL:

```sh
docker compose up -d postgres
```

5. Выполнить:

```sh
npm ci
npm run db:migrate
npm run seed:admin
npm run build
```

6. Запустить SvelteKit-приложение через process manager, например `pm2`, или собрать Dockerfile для приложения.

Для продакшена обязательно:

- не использовать пароль из `.env.example`;
- поставить длинный `BETTER_AUTH_SECRET`;
- настроить backup PostgreSQL;
- закрыть порт PostgreSQL от внешнего интернета;
- запускать сайт за reverse proxy с HTTPS.

## Основные команды

```sh
npm run dev
npm run check
npm run build
npm run db:generate
npm run db:migrate
npm run db:studio
npm run seed:admin
```
