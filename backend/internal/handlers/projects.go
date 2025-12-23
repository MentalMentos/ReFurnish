package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"refurnish/internal/db"
)

type Project struct {
	ID             string `json:"id"`
	Title          string `json:"title"`
	Description    string `json:"description"`
	Furniture      string `json:"furnitureType"`
	Budget         int    `json:"budget"`
	Deadline       string `json:"deadline"`
	City           string `json:"city"`
	Status         string `json:"status"`
	ClientID       string `json:"clientId"`
	AssignedMaster string `json:"assignedMaster,omitempty"`
}

// Создание проекта
func CreateProject(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Furniture   string `json:"furnitureType"`
		Budget      int    `json:"budget"`
		Deadline    string `json:"deadline"`
		City        string `json:"city"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	clientID := r.Context().Value("user_id")

	_, err := db.Connect().Exec(`
		INSERT INTO projects (client_id, title, description, furniture_type, budget, deadline, city, status)
		VALUES ($1,$2,$3,$4,$5,$6,$7,'published')
	`, clientID, req.Title, req.Description, req.Furniture, req.Budget, req.Deadline, req.City)

	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// Список открытых проектов
func OpenProjects(w http.ResponseWriter, r *http.Request) {
	city := r.URL.Query().Get("city")
	furniture := r.URL.Query().Get("furniture")

	query := "SELECT id, title, description, furniture_type, budget, deadline, city, status FROM projects WHERE status='published'"
	args := []interface{}{}

	if city != "" {
		query += " AND city=$1"
		args = append(args, city)
	}
	if furniture != "" {
		query += " AND furniture_type=$2"
		args = append(args, furniture)
	}

	rows, _ := db.Connect().Query(query, args...)

	var res []map[string]interface{}
	for rows.Next() {
		var p Project
		rows.Scan(&p.ID, &p.Title, &p.Description, &p.Furniture, &p.Budget, &p.Deadline, &p.City, &p.Status)
		res = append(res, map[string]interface{}{
			"id":            p.ID,
			"title":         p.Title,
			"description":   p.Description,
			"furnitureType": p.Furniture,
			"budget":        p.Budget,
			"deadline":      p.Deadline,
			"city":          p.City,
			"status":        p.Status,
		})
	}
	json.NewEncoder(w).Encode(res)
}

// Список проектов клиента
func MyProjects(w http.ResponseWriter, r *http.Request) {
	clientID := r.Context().Value("user_id")
	rows, _ := db.Connect().Query(`
		SELECT id, title, description, furniture_type, budget, deadline, city, status FROM projects WHERE client_id=$1
	`, clientID)

	var res []map[string]interface{}
	for rows.Next() {
		var p Project
		rows.Scan(&p.ID, &p.Title, &p.Description, &p.Furniture, &p.Budget, &p.Deadline, &p.City, &p.Status)
		res = append(res, map[string]interface{}{
			"id":            p.ID,
			"title":         p.Title,
			"description":   p.Description,
			"furnitureType": p.Furniture,
			"budget":        p.Budget,
			"deadline":      p.Deadline,
			"city":          p.City,
			"status":        p.Status,
		})
	}
	json.NewEncoder(w).Encode(res)
}

// Присвоение мастера (закрытие проекта)
func AssignMaster(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")
	var req struct {
		MasterID string `json:"masterId"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	_, err := db.Connect().Exec(`
		UPDATE projects SET status='assigned', assigned_master=$1 WHERE id=$2
	`, req.MasterID, projectID)

	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"status": "assigned"})
}

// Редактирование проекта
func EditProject(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")
	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Furniture   string `json:"furnitureType"`
		Budget      int    `json:"budget"`
		Deadline    string `json:"deadline"`
		City        string `json:"city"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	_, err := db.Connect().Exec(`
		UPDATE projects
		SET title=$1, description=$2, furniture_type=$3, budget=$4, deadline=$5, city=$6
		WHERE id=$7
	`, req.Title, req.Description, req.Furniture, req.Budget, req.Deadline, req.City, projectID)

	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

// Просмотр откликов по проекту
func ProjectResponses(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")

	rows, _ := db.Connect().Query(`
		SELECT r.id, u.email, r.comment, r.price, r.start_date
		FROM responses r
		JOIN users u ON u.id = r.master_id
		WHERE r.project_id=$1
	`, projectID)

	var res []map[string]interface{}
	for rows.Next() {
		var id, email, comment, startDate string
		var price int
		rows.Scan(&id, &email, &comment, &price, &startDate)

		res = append(res, map[string]interface{}{
			"id":        id,
			"master":    email,
			"comment":   comment,
			"price":     price,
			"startDate": startDate,
		})
	}
	json.NewEncoder(w).Encode(res)
}
