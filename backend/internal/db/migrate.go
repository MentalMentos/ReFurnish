package db

import (
	"log"
	"refurnish/internal/config"
	"refurnish/internal/models"
)

func RunMigrations() {
	db := config.GetDB()

	// Автомиграция моделей
	err := db.AutoMigrate(
		&models.User{},
		&models.Master{},
		&models.Client{},
		&models.Project{},
		&models.Response{},
		// добавьте другие модели здесь
	)

	if err != nil {
		log.Fatal("Migration failed:", err)
	}

	log.Println("Migrations applied successfully")
}
