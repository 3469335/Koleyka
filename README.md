# Koleyka - Next.js + Prisma + NeonDB

Минимальный рабочий проект на Next.js (App Router) с Prisma и NeonDB (PostgreSQL), готовый к деплою на Vercel.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и заполните `DATABASE_URL`:

```bash
cp .env.example .env
```

Или используйте существующий `.env` файл с вашими данными NeonDB.

### 3. Настройка базы данных

#### Генерация Prisma Client

```bash
npm run db:generate
```

#### Создание миграции

```bash
npm run db:migrate
```

При первом запуске Prisma предложит создать миграцию. Введите имя миграции (например, `init`).

#### Заполнение базы тестовыми данными (опционально)

```bash
npm run db:seed
```

### 4. Запуск проекта

#### Режим разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

#### Сборка для продакшена

```bash
npm run build
npm start
```

## 📁 Структура проекта

```
koleyka/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Корневой layout
│   ├── page.tsx           # Главная страница (читает данные из БД)
│   └── globals.css        # Глобальные стили
├── lib/
│   └── prisma.ts          # Prisma Client (singleton)
├── prisma/
│   ├── schema.prisma      # Схема базы данных
│   └── seed.ts            # Seed скрипт для тестовых данных
├── .env                   # Переменные окружения (не в git)
├── .env.example           # Пример переменных окружения
├── package.json           # Зависимости и скрипты
├── tsconfig.json          # TypeScript конфигурация
├── next.config.js         # Next.js конфигурация
└── vercel.json            # Конфигурация для Vercel
```

## 🗄️ Модель данных

### Note

- `id` (uuid) - уникальный идентификатор
- `title` (string) - заголовок заметки
- `createdAt` (DateTime) - дата создания

## 📦 Доступные команды

- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка для продакшена
- `npm start` - запуск продакшен сборки
- `npm run lint` - проверка кода линтером
- `npm run db:generate` - генерация Prisma Client
- `npm run db:migrate` - создание/применение миграций
- `npm run db:seed` - заполнение базы тестовыми данными
- `npm run db:studio` - открытие Prisma Studio (GUI для БД)

## 🚢 Деплой на Vercel

### Подготовка

1. Убедитесь, что проект работает локально
2. Закоммитьте все изменения в git
3. Создайте репозиторий на GitHub (если еще нет)

### Деплой через Vercel CLI

```bash
# Установка Vercel CLI (если еще не установлен)
npm i -g vercel

# Деплой
vercel
```

### Деплой через веб-интерфейс Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "Add New Project"
3. Импортируйте ваш GitHub репозиторий
4. Настройте переменные окружения:
   - `DATABASE_URL` - строка подключения к NeonDB
5. Vercel автоматически определит Next.js и выполнит сборку

### Важные моменты для деплоя

- ✅ `DATABASE_URL` должен быть добавлен в Environment Variables в настройках проекта Vercel
- ✅ Prisma автоматически сгенерирует клиент при сборке (благодаря `vercel.json`)
- ✅ После деплоя выполните миграцию на продакшен БД:
  ```bash
  npx prisma migrate deploy
  ```
  Или используйте Prisma Migrate в NeonDB Dashboard

### Выполнение миграций на продакшене

После первого деплоя нужно применить миграции к продакшен базе:

```bash
# Установите DATABASE_URL для продакшена
export DATABASE_URL="your-production-database-url"

# Примените миграции
npx prisma migrate deploy
```

Или используйте Prisma Migrate в NeonDB Dashboard.

## 🔧 Настройка NeonDB

1. Создайте аккаунт на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте Connection String
4. Добавьте его в `.env` как `DATABASE_URL`

## 📝 Примеры использования

### Чтение данных на сервере (Server Component)

```tsx
import { prisma } from '@/lib/prisma'

async function getNotes() {
  return await prisma.note.findMany()
}
```

### Использование в API Route

```tsx
// app/api/notes/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const notes = await prisma.note.findMany()
  return NextResponse.json(notes)
}
```

## 🛠️ Технологии

- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - типизация
- **Prisma** - ORM для работы с базой данных
- **NeonDB** - серверless PostgreSQL
- **Vercel** - платформа для деплоя

## 📄 Лицензия

См. файл [LICENSE](LICENSE)
