# Dockerfile
FROM golang:1.24-alpine

WORKDIR /app

# Скопировать go.mod/go.sum и скачать зависимости
COPY go.mod go.sum ./
RUN go mod download

# Копируем весь backend код
COPY . .

# Собираем бинарник
RUN go build -o server ./cmd/server

EXPOSE 8080

CMD ["./server"]
