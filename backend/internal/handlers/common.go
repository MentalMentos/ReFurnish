// internal/handlers/common.go
package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"time"

	"refurnish/internal/config"
	"refurnish/internal/models"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

// GetProjectDetails - GET /api/project/{id}
func GetProjectDetails(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")

	log.Printf("🔍 Запрос деталей проекта: ID=%s", projectID)

	db := config.GetDB()

	var project models.Project
	// ИСПРАВЛЕНИЕ: используем Where с условием для UUID
	if err := db.Where("id = ?", projectID).First(&project).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("❌ Проект не найден: ID=%s", projectID)
			http.Error(w, "Проект не найден", http.StatusNotFound)
			return
		}
		log.Printf("❌ Ошибка базы данных: %v", err)
		http.Error(w, "Ошибка сервера", http.StatusInternalServerError)
		return
	}

	log.Printf("✅ Проект найден: %s (ID: %s)", project.Title, project.ID)

	// Загружаем клиента
	var client models.Client
	if err := db.First(&client, "id = ?", project.ClientID).Error; err != nil {
		log.Printf("⚠️  Клиент не найден для проекта: %v", err)
		client = models.Client{}
	}

	// Загружаем пользователя клиента
	var clientUser models.User
	if client.UserID != "" {
		db.First(&clientUser, "id = ?", client.UserID)
	}

	// Формируем ответ
	response := map[string]interface{}{
		"id":            project.ID,
		"title":         project.Title,
		"description":   project.Description,
		"furnitureType": project.FurnitureType,
		"budget":        project.Budget,
		"deadline":      project.Deadline.Format("2006-01-02"),
		"city":          project.City,
		"status":        project.Status,
		"createdAt":     project.CreatedAt.Format(time.RFC3339),
	}

	if clientUser.ID != "" && clientUser.Client != nil { // Проверяем и clientUser.Client
		response["clientName"] = clientUser.Client.Name
		response["clientEmail"] = clientUser.Email
		response["clientPhone"] = "+79213946509"
	} else {
		response["clientName"] = "Неизвестный клиент"
		response["clientEmail"] = "email@example.com"
	}

	// Если есть мастер, добавляем его данные
	if project.MasterID != nil && *project.MasterID != "" {
		var master models.Master
		if err := db.First(&master, "id = ?", *project.MasterID).Error; err == nil {
			var masterUser models.User
			db.First(&masterUser, "id = ?", master.UserID)

			response["masterEmail"] = masterUser.Email
			response["masterPhone"] = "+79213946509"
		}
	}

	log.Printf("📤 Отправляю данные проекта: %s", project.Title)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
