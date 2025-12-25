package config

import (
	"fmt"
	"log"
	"os"
	"sync"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	db     *gorm.DB
	dbOnce sync.Once
)

func GetDB() *gorm.DB {
	dbOnce.Do(func() {
		var err error
		db, err = connectDB()
		if err != nil {
			log.Fatal("Failed to connect to database:", err)
		}

		log.Println("Database connected and migrations applied")
	})
	return db
}

func connectDB() (*gorm.DB, error) {
	// Определяем хост в зависимости от окружения
	host := getDBHost()
	port := "5432"
	user := "postgres"
	password := "postgres" // или "pass" в зависимости от docker-compose
	dbname := "refurnish"
	sslmode := "disable"

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	log.Printf("Connecting to database: %s@%s:%s/%s", user, host, port, dbname)

	return gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
}

func getDBHost() string {
	// Если есть переменная окружения DB_HOST - используем её
	if host := os.Getenv("DB_HOST"); host != "" {
		return host
	}

	// Проверяем, запущены ли мы в Docker
	// Способ 1: проверка файла /.dockerenv
	if _, err := os.Stat("/.dockerenv"); err == nil {
		return "db" // в Docker
	}

	// Способ 2: проверка наличия хоста "db" (только для Docker)
	// Если не можем определить - используем localhost для локальной разработки
	return "localhost"
}
