# АІС «Миючі засоби»

Автоматизована інформаційна система для обліку закупівлі та витрати миючих засобів (господарського інвентарю). Розроблена в рамках дипломної роботи.

## 🛠 Технічний стек
- **Frontend:** React, Vite, React Router, CSS Modules.
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL + Prisma ORM.
- **Infrastructure:** Docker & Docker Compose.

## 🚀 Як запустити локально через Docker (Рекомендовано)

1. Переконайтеся, що у вас встановлені Docker та Docker Desktop.
2. Клонуйте репозиторій.
3. У корені проекту виконайте команду:

   `docker-compose up -d --build`

4. Відкрийте фронтенд: `http://localhost:5173`
5. API бекенду доступне за адресою: `http://localhost:5000/api`

## 🌱 Наповнення тестовими даними (Seed)
Щоб заповнити базу початковими даними:
1. Зайдіть у контейнер бекенду: `docker exec -it cleaning_ais_backend sh`
2. Виконайте міграції та наповнення:
   `npx prisma migrate deploy`
   `npm run seed` *(якщо ви додали скрипт seed у package.json)*