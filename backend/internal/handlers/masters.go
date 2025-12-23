package handlers

import (
	"encoding/json"
	"net/http"

	"refurnish/internal/db"
)

func ListMasters(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Connect().Query(`
		SELECT u.id, m.name, m.description, m.city, m.specializations, m.price_from, m.rating
		FROM masters m
		JOIN users u ON u.id = m.user_id
	`)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	var res []map[string]interface{}

	for rows.Next() {
		var (
			id, name, description, city string
			specializations             []string
			priceFrom, rating           int
		)

		rows.Scan(&id, &name, &description, &city, &specializations, &priceFrom, &rating)

		res = append(res, map[string]interface{}{
			"id":              id,
			"name":            name,
			"description":     description,
			"city":            city,
			"specializations": specializations,
			"priceFrom":       priceFrom,
			"rating":          rating,
		})
	}

	json.NewEncoder(w).Encode(res)
}
