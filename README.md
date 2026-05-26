# Журнал работ на строительном объекте

Простой внутренний сайт для прораба: записать, что сделали на площадке, в каком объёме и кто выполнял. Всё хранится в PostgreSQL — после перезапуска контейнеров записи на месте.

---

## Для пользователя (прораб, мастер)

### Зачем это нужно

На объекте каждый день идут разные работы. Вместо блокнота или мессенджера — одна таблица: **дата → что делали → сколько → кто**. Удобно отчитаться перед заказчиком или посмотреть, что было на прошлой неделе.

### Как открыть

1. Запустите проект (см. [Быстрый старт](#быстрый-старт)).
2. В браузере: **http://localhost:5173**

Логин не нужен — журнал для внутренней сети объекта.

### Экран по блокам

| Блок | Что делать |
|------|------------|
| **Новая запись** | Дата, **вид работ** из списка, объём, **единица** из списка (м³, м², шт. и т.д.), ФИО. Кнопка **«Добавить в журнал»**. |
| **Отбор и поиск** | Поиск по ФИО или виду работ, период «с» / «по», сортировка, **«Показать»**. |
| **Таблица** | Все записи. **Изменить** — форма сверху. **Удалить** — с подтверждением. |

### Подсказки

- Красный текст под полем — исправьте до сохранения.
- Вид работ и единица — только из выпадающих списков.
- При правке записи внизу формы есть **«Отмена»**.

### Частые вопросы

**Записи пропали?**  
При обычном перезапуске Docker данные остаются (том Postgres). Если делали `docker compose down -v` — база обнулилась.

**С телефона?**  
Да: крупные кнопки, таблица с горизонтальной прокруткой.

---

## Быстрый старт

```bash
cd construction-journal
docker compose up --build
```

Откройте **http://localhost:5173**

| Сервис | Адрес |
|--------|--------|
| UI | http://localhost:5173 |
| API | http://localhost:3001/api/health |
| Postgres | `localhost:5434`, БД `construction_journal`, user/pass `journal` |

Миграции и seed справочника видов работ выполняются при старте backend автоматически.

---

## Для разработчика

### Стек

| Слой | Технология |
|------|------------|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| БД | PostgreSQL 16 |
| Тесты | Vitest (unit), Playwright (e2e) |

### Структура

```
construction-journal/
├── backend/           # API, Prisma
├── frontend/          # React UI
├── e2e/               # Playwright
├── docker-compose.yml
└── package.json       # test, test:e2e
```

### Локально без Docker

1. Postgres и переменная `DATABASE_URL` (см. `docker-compose.yml`, порт **5434** с хоста).
2. Backend:
   ```bash
   cd backend
   npm install
   npx prisma migrate deploy
   npx prisma db seed
   npm run dev
   ```
3. Frontend (отдельный терминал):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Vite проксирует `/api` на `http://localhost:3001`.

### Prisma

Схема: `backend/prisma/schema.prisma`.

```bash
cd backend
export DATABASE_URL="postgresql://journal:journal@localhost:5434/construction_journal"

npm run db:generate      # клиент после правок schema
npx prisma migrate dev --name имя_изменения   # новая миграция (dev)
npm run db:migrate       # применить миграции (как в Docker)
npx prisma db seed       # справочник видов работ
```

### API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health` | Проверка |
| GET | `/api/work-types` | Справочник работ |
| GET | `/api/entries?dateFrom=&dateTo=&q=&sort=asc\|desc` | Список (`q` — поиск по ФИО и виду работ) |
| POST | `/api/entries` | Создать |
| PUT | `/api/entries/:id` | Изменить |
| DELETE | `/api/entries/:id` | Удалить (204) |

### Тесты

Юнит-тесты (API-моки, без живой БД):

```bash
cd backend && npm install && npm test
cd ../frontend && npm install && npm test

# из корня проекта:
npm install
npm test
```

E2E (нужен поднятый `docker compose`):

```bash
docker compose up --build -d
npm install
npx playwright install chromium
npm run test:e2e
```

`BASE_URL` по умолчанию `http://localhost:5173`.

### Реализовано

- [x] Список записей, фильтр и сортировка по дате
- [x] Создание, редактирование, удаление с confirm
- [x] Справочник видов работ (`work_types` + seed)
- [x] Единицы измерения — select (м³, м², п.м., шт., т, кг)
- [x] Валидация на фронте (Zod на бэке)
- [x] Docker Compose, unit + e2e тесты

### Вне scope

Авторизация, роли, мультитенантность, мобильное приложение.
