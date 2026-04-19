FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Запускаємо Vite так, щоб він слухав усі мережеві інтерфейси в Docker
CMD ["npm", "run", "dev"]