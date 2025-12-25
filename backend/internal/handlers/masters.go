package handlers

import (
	"encoding/json"
	"net/http"

	"refurnish/internal/config"
	"refurnish/internal/models"
)

func ListMasters(w http.ResponseWriter, r *http.Request) {
	db := config.GetDB()

	var masters []models.Master
	if err := db.Preload("User").
		Find(&masters).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var response []map[string]interface{}
	for _, master := range masters {
		response = append(response, map[string]interface{}{
			"id":              master.ID,
			"userId":          master.UserID,
			"name":            master.Name,
			"description":     master.Description,
			"city":            master.City,
			"specializations": master.Specializations,
			"priceFrom":       master.PriceFrom,
			"rating":          master.Rating,
			"email":           master.User.Email,
		})
	}

	json.NewEncoder(w).Encode(response)
}

// Обновление профиля мастера
func UpdateMasterProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	var req struct {
		Name            string   `json:"name"`
		Description     string   `json:"description"`
		City            string   `json:"city"`
		Specializations []string `json:"specializations"`
		PriceFrom       int      `json:"priceFrom"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	db := config.GetDB()

	// Находим мастера по user_id
	var master models.Master
	if err := db.Where("user_id = ?", userID).First(&master).Error; err != nil {
		http.Error(w, "Master not found", http.StatusNotFound)
		return
	}

	// Обновляем поля
	master.Name = req.Name
	master.Description = req.Description
	master.City = req.City
	master.Specializations = req.Specializations
	master.PriceFrom = req.PriceFrom

	if err := db.Save(&master).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"status":   "updated",
		"masterId": master.ID,
	})
}

// GetMasterProfile - GET /api/master/profile
func GetMasterProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(uint)
	db := config.GetDB()

	var master models.Master
	if err := db.Where("user_id = ?", userID).First(&master).Error; err != nil {
		http.Error(w, "Мастер не найден", http.StatusNotFound)
		return
	}

	var user models.User
	db.First(&user, userID)

	response := map[string]interface{}{
		"id":     master.ID,
		"name":   user.Email,
		"email":  user.Email,
		"phone":  "+79213946509",
		"city":   master.City,
		"rating": master.Rating,
	}

	jsonResponse(w, response)
}

// MasterAssignedProjects - GET /api/master/assigned-projects
func MasterAssignedProjects(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(uint)
	db := config.GetDB()

	var master models.Master
	if err := db.Where("user_id = ?", userID).First(&master).Error; err != nil {
		http.Error(w, "Мастер не найден", http.StatusNotFound)
		return
	}

	var projects []models.Project
	db.Preload("Client.User").Where("master_id = ?", master.ID).Find(&projects)

	var result []map[string]interface{}
	for _, project := range projects {
		result = append(result, map[string]interface{}{
			"id":            project.ID,
			"title":         project.Title,
			"description":   project.Description,
			"furnitureType": project.FurnitureType,
			"budget":        project.Budget,
			"deadline":      project.Deadline,
			"city":          project.City,
			"status":        project.Status,
			"clientName":    project.Client.User.Email,
			"clientPhone":   "+79213946509",
		})
	}

	jsonResponse(w, result)
}
