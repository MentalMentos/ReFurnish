package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"refurnish/internal/db"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"` // "client" или "master"
}

// Регистрация
func Register(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	json.NewDecoder(r.Body).Decode(&req)

	hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 14)
	_, err := db.Connect().Exec(`
		INSERT INTO users (email, password, role) VALUES ($1,$2,$3)
	`, req.Email, string(hashed), req.Role)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// Вход
func Login(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	json.NewDecoder(r.Body).Decode(&req)

	row := db.Connect().QueryRow(`SELECT id, password, role FROM users WHERE email=$1`, req.Email)
	var id, password, role string
	err := row.Scan(&id, &password, &role)
	if err != nil {
		http.Error(w, "user not found", 401)
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(password), []byte(req.Password)) != nil {
		http.Error(w, "wrong password", 401)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": id,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "secret"
	}

	t, _ := token.SignedString([]byte(secret))
	json.NewEncoder(w).Encode(map[string]string{"token": t})
}
