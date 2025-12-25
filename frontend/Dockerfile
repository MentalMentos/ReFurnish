FROM node:20-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Создаем .env файл для Docker (опционально)
RUN echo "VITE_API_URL=http://localhost:8080" > .env.production
RUN echo "VITE_API_URL=http://localhost:8080" > .env.development

# Открываем порт
EXPOSE 5173

# Запускаем dev сервер
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]