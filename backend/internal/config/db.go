package config

import (
	"fmt"
	"log"
	"sync"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"refurnish/internal/models"
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

		// Автомиграция
		err = db.AutoMigrate(
			&models.User{},
			&models.Master{},
			&models.Client{},
			&models.Project{},
			&models.Response{},
		)
		if err != nil {
			log.Fatal("Failed to run migrations:", err)
		}

		log.Println("Database connected and migrations applied")
	})
	return db
}

func connectDB() (*gorm.DB, error) {
	// В Docker всегда используем "db"
	host := "pg" // <-- ВАЖНО: должно быть "db" а не localhost или 127.0.0.1
	port := "5432"
	user := "user"
	password := "pass"
	dbname := "refurnish"
	sslmode := "disable"

	// Формируем DSN строку
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	// Добавим отладочный вывод
	log.Printf("DSN for database connection: %s", dsn)
	log.Printf("Attempting to connect to host: %s, port: %s", host, port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Printf("Connection failed with DSN: host=%s, port=%s, user=%s, dbname=%s",
			host, port, user, dbname)
	}

	return db, err
}
