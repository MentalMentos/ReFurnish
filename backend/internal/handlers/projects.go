package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"refurnish/internal/config"
	"refurnish/internal/models"

	"github.com/go-chi/chi/v5"
)

// Создание проекта
func CreateProject(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Furniture   string `json:"furnitureType"`
		Budget      int    `json:"budget"`
		Deadline    string `json:"deadline"`
		City        string `json:"city"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Парсим дату дедлайна
	deadline, err := time.Parse("2006-01-02", req.Deadline)
	if err != nil {
		http.Error(w, "Invalid date format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	db := config.GetDB()

	project := models.Project{
		ClientID:      userID,
		Title:         req.Title,
		Description:   req.Description,
		FurnitureType: req.Furniture,
		Budget:        req.Budget,
		Deadline:      deadline,
		City:          req.City,
		Status:        "published",
	}

	if err := db.Create(&project).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "ok",
		"projectId": project.ID,
	})
}

// Список открытых проектов
func OpenProjects(w http.ResponseWriter, r *http.Request) {
	city := r.URL.Query().Get("city")
	furniture := r.URL.Query().Get("furniture")

	db := config.GetDB()

	query := db.Model(&models.Project{}).Where("status = ?", "published")

	if city != "" {
		query = query.Where("city = ?", city)
	}
	if furniture != "" {
		query = query.Where("furniture_type = ?", furniture)
	}

	var projects []models.Project
	if err := query.Preload("Client.User").Find(&projects).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var response []map[string]interface{}
	for _, project := range projects {
		response = append(response, map[string]interface{}{
			"id":            project.ID,
			"title":         project.Title,
			"description":   project.Description,
			"furnitureType": project.FurnitureType,
			"budget":        project.Budget,
			"deadline":      project.Deadline.Format("2006-01-02"),
			"city":          project.City,
			"status":        project.Status,
			"clientName":    project.Client.User.Email,
			"createdAt":     project.CreatedAt.Format(time.RFC3339),
		})
	}

	json.NewEncoder(w).Encode(response)
}

// Список проектов клиента
func MyProjects(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	db := config.GetDB()

	var projects []models.Project
	if err := db.Where("client_id = ?", userID).
		Preload("Master").
		Find(&projects).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var response []map[string]interface{}
	for _, project := range projects {
		projectData := map[string]interface{}{
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

		if project.Master != nil {
			projectData["assignedMaster"] = map[string]interface{}{
				"id":   project.Master.ID,
				"name": project.Master.Name,
			}
		}

		response = append(response, projectData)
	}

	json.NewEncoder(w).Encode(response)
}

// Присвоение мастера (закрытие проекта)
func AssignMaster(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")

	var req struct {
		MasterID string `json:"masterId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	db := config.GetDB()

	// Проверяем существование мастера
	var master models.Master
	if err := db.Where("id = ?", req.MasterID).First(&master).Error; err != nil {
		http.Error(w, "Master not found", http.StatusNotFound)
		return
	}

	// Обновляем проект
	result := db.Model(&models.Project{}).
		Where("id = ?", projectID).
		Updates(map[string]interface{}{
			"status":          "assigned",
			"assigned_master": req.MasterID,
			"updated_at":      time.Now(),
		})

	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"status":    "assigned",
		"projectId": projectID,
		"masterId":  req.MasterID,
	})
}
