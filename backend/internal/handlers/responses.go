package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"refurnish/internal/config"
	"refurnish/internal/models"
)

// Отклик на проект
func RespondToProject(w http.ResponseWriter, r *http.Request) {
	masterID := r.Context().Value("user_id").(string)

	var req struct {
		ProjectID string `json:"projectId"`
		Comment   string `json:"comment"`
		Price     int    `json:"price"`
		StartDate string `json:"startDate"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Парсим дату начала работ
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		http.Error(w, "Invalid date format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	db := config.GetDB()

	// Проверяем существование проекта
	var project models.Project
	if err := db.Where("id = ? AND status = ?", req.ProjectID, "published").
		First(&project).Error; err != nil {
		http.Error(w, "Project not found or not available", http.StatusNotFound)
		return
	}

	// Проверяем, не откликался ли уже мастер
	var existingResponse models.Response
	if err := db.Where("project_id = ? AND master_id = ?", req.ProjectID, masterID).
		First(&existingResponse).Error; err == nil {
		http.Error(w, "You have already responded to this project", http.StatusBadRequest)
		return
	}

	// Создаем отклик
	response := models.Response{
		ProjectID: req.ProjectID,
		MasterID:  masterID,
		Comment:   req.Comment,
		Price:     req.Price,
		StartDate: startDate,
	}

	if err := db.Create(&response).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":     "responded",
		"responseId": response.ID,
		"projectId":  req.ProjectID,
	})
}

// Мои отклики
func MyResponses(w http.ResponseWriter, r *http.Request) {
	masterID := r.Context().Value("user_id").(string)

	db := config.GetDB()

	var responses []models.Response
	if err := db.Where("master_id = ?", masterID).
		Preload("Project").
		Find(&responses).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var result []map[string]interface{}
	for _, response := range responses {
		result = append(result, map[string]interface{}{
			"id":        response.ID,
			"projectId": response.ProjectID,
			"title":     response.Project.Title,
			"comment":   response.Comment,
			"price":     response.Price,
			"startDate": response.StartDate.Format("2006-01-02"),
			"createdAt": response.CreatedAt.Format(time.RFC3339),
			"status":    response.Project.Status,
		})
	}

	json.NewEncoder(w).Encode(result)
}
