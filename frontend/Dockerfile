FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код фронтенда
COPY . .

# Экспонируем порт Vite
EXPOSE 5173

# Запускаем dev сервер с доступом снаружи
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]