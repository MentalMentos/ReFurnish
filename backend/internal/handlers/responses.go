package handlers

import (
	"encoding/json"
	"net/http"

	"refurnish/internal/db"
)

func RespondToProject(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ProjectID string `json:"projectId"`
		Comment   string `json:"comment"`
		Price     int    `json:"price"`
		StartDate string `json:"startDate"`
	}

	json.NewDecoder(r.Body).Decode(&req)

	masterID := r.Context().Value("user_id")

	_, err := db.Connect().Exec(`
		INSERT INTO responses (project_id, master_id, comment, price, start_date)
		VALUES ($1,$2,$3,$4,$5)
	`,
		req.ProjectID,
		masterID,
		req.Comment,
		req.Price,
		req.StartDate,
	)

	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
}

func MyResponses(w http.ResponseWriter, r *http.Request) {
	masterID := r.Context().Value("user_id")

	rows, err := db.Connect().Query(`
		SELECT r.id, p.title, r.comment, r.price, r.start_date
		FROM responses r
		JOIN projects p ON p.id = r.project_id
		WHERE r.master_id = $1
	`, masterID)

	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	var res []map[string]interface{}

	for rows.Next() {
		var id, title, comment, startDate string
		var price int

		rows.Scan(&id, &title, &comment, &price, &startDate)

		res = append(res, map[string]interface{}{
			"id":        id,
			"title":     title,
			"comment":   comment,
			"price":     price,
			"startDate": startDate,
		})
	}

	json.NewEncoder(w).Encode(res)
}
