FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Генеруємо клієнт Prisma всередині контейнера
RUN npx prisma generate
EXPOSE 5000
CMD npx prisma db push && npm run start