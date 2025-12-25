package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"refurnish/internal/config"
	"refurnish/internal/models"

	"github.com/go-chi/chi/v5"
)

// Создание проекта
func CreateProject(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)

	log.Printf("📝 Создание проекта для user_id: %s", userID)

	var req struct {
		Title         string `json:"title"`
		Description   string `json:"description"`
		FurnitureType string `json:"furnitureType"`
		Budget        int    `json:"budget"`
		Deadline      string `json:"deadline"`
		City          string `json:"city"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("❌ Ошибка парсинга JSON: %v", err)
		http.Error(w, "Неверный формат запроса", http.StatusBadRequest)
		return
	}

	log.Printf("📋 Данные проекта: %+v", req)

	var deadline time.Time
	var err error

	// 1. Пробуем YYYY-MM-DD (стандартный формат HTML input type="date")
	deadline, err = time.Parse("2006-01-02", req.Deadline)
	if err != nil {
		// 2. Пробуем MM-DD-YYYY (то что приходит сейчас)
		deadline, err = time.Parse("01-02-2006", req.Deadline)
		if err != nil {
			// 3. Пробуем DD.MM.YYYY
			deadline, err = time.Parse("02.01.2006", req.Deadline)
			if err != nil {
				log.Printf("❌ Ошибка парсинга даты '%s': %v", req.Deadline, err)
				http.Error(w, "Неверный формат даты. Используйте YYYY-MM-DD", http.StatusBadRequest)
				return
			}
		}
	}

	db := config.GetDB()

	// Находим клиента
	var client models.Client
	if err := db.Where("user_id = ?", userID).First(&client).Error; err != nil {
		log.Printf("❌ Клиент не найден для user_id: %s", userID)
		http.Error(w, "Клиент не найден. Сначала создайте профиль клиента.", http.StatusNotFound)
		return
	}

	log.Printf("✅ Найден клиент с ID: %s", client.ID)

	// ВАЖНО: Создаем простую структуру без сложных связей
	projectData := map[string]interface{}{
		"title":          req.Title,
		"description":    req.Description,
		"furniture_type": req.FurnitureType,
		"budget":         req.Budget,
		"deadline":       deadline,
		"city":           req.City,
		"status":         "published",
		"client_id":      client.ID,
		"created_at":     time.Now(),
		"updated_at":     time.Now(),
	}

	// Выполняем сырой SQL запрос
	result := db.Exec(`
		INSERT INTO projects (title, description, furniture_type, budget, 
			deadline, city, status, client_id, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`,
		projectData["title"],
		projectData["description"],
		projectData["furniture_type"],
		projectData["budget"],
		projectData["deadline"],
		projectData["city"],
		projectData["status"],
		projectData["client_id"],
		projectData["created_at"],
		projectData["updated_at"],
	)

	if result.Error != nil {
		log.Printf("❌ Ошибка создания проекта: %v", result.Error)
		http.Error(w, "Ошибка создания проекта: "+result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Получаем ID созданного проекта
	var projectID string
	db.Raw("SELECT id FROM projects WHERE client_id = ? ORDER BY created_at DESC LIMIT 1", client.ID).Scan(&projectID)

	log.Printf("🎉 Проект успешно создан с ID: %s", projectID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "ok",
		"projectId": projectID,
		"message":   "Проект успешно создан",
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

	log.Printf("🔍 MyProjects: user_id=%s", userID)

	db := config.GetDB()

	// 1. Сначала находим клиента по user_id
	var client models.Client
	if err := db.Where("user_id = ?", userID).First(&client).Error; err != nil {
		log.Printf("❌ Клиент не найден для user_id=%s", userID)
		json.NewEncoder(w).Encode([]interface{}{})
		return
	}

	log.Printf("✅ Найден клиент: ID=%s", client.ID)

	// 2. Теперь ищем проекты по client_id (ID клиента, а не user_id!)
	var projects []models.Project
	if err := db.Where("client_id = ?", client.ID).
		Preload("Master").
		Find(&projects).Error; err != nil {
		log.Printf("❌ Ошибка поиска проектов: %v", err)
		json.NewEncoder(w).Encode([]interface{}{})
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

func GetClientProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	db := config.GetDB()

	var client models.Client
	if err := db.Where("user_id = ?", userID).First(&client).Error; err != nil {
		http.Error(w, "Клиент не найден", http.StatusNotFound)
		return
	}

	var user models.User
	db.First(&user, userID)

	response := map[string]interface{}{
		"id":    client.ID,
		"email": user.Email,
		"phone": "+79213946509",
	}

	jsonResponse(w, response)
}

// EditProject - PUT /api/client/project/{id}
func EditProject(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	projectID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	db := config.GetDB()

	var project models.Project
	if err := db.Preload("Client").First(&project, projectID).Error; err != nil {
		http.Error(w, "Проект не найден", http.StatusNotFound)
		return
	}

	if project.Client.UserID != userID {
		http.Error(w, "Нет доступа", http.StatusForbidden)
		return
	}

	var input struct {
		Title         string `json:"title"`
		Description   string `json:"description"`
		FurnitureType string `json:"furnitureType"`
		Budget        int    `json:"budget"`
		Deadline      string `json:"deadline"`
		City          string `json:"city"`
		Status        string `json:"status"`
	}

	if err := parseJSON(r, &input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	timee, err := time.Parse("2006-01-02", input.Deadline)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	project.Title = input.Title
	project.Description = input.Description
	project.FurnitureType = input.FurnitureType
	project.Budget = input.Budget
	project.Deadline = timee
	project.City = input.City
	project.Status = input.Status

	if err := db.Save(&project).Error; err != nil {
		http.Error(w, "Ошибка сохранения", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, project)
}

// ProjectResponses - GET /api/client/project/{id}/responses
func ProjectResponses(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(string)
	projectID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	db := config.GetDB()

	var project models.Project
	if err := db.Preload("Client").First(&project, projectID).Error; err != nil {
		http.Error(w, "Проект не найден", http.StatusNotFound)
		return
	}

	if project.Client.UserID != userID {
		http.Error(w, "Нет доступа", http.StatusForbidden)
		return
	}

	var responses []models.Response
	db.Preload("Master.User").Where("project_id = ?", projectID).Find(&responses)

	var result []map[string]interface{}
	for _, resp := range responses {
		result = append(result, map[string]interface{}{
			"id":          resp.ID,
			"price":       resp.Price,
			"createdAt":   resp.CreatedAt,
			"masterPhone": "+79213946509",
			"masterEmail": resp.Master.User.Email,
		})
	}

	jsonResponse(w, result)
}
