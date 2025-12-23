package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"time"

	"refurnish/internal/config"
	"refurnish/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"` // "client" или "master"
	Name     string `json:"name,omitempty"`
}

// Регистрация
func Register(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Хеширование пароля
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 14)
	if err != nil {
		http.Error(w, "Password error", http.StatusInternalServerError)
		return
	}

	db := config.GetDB()

	// Создание пользователя
	user := models.User{
		Email:    req.Email,
		Password: string(hashedPassword),
		Role:     req.Role,
	}

	// Начало транзакции
	tx := db.Begin()

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		http.Error(w, "Email already exists", http.StatusBadRequest)
		return
	}

	// Создание профиля в зависимости от роли
	if req.Role == "master" {
		master := models.Master{
			UserID:      user.ID,
			Name:        req.Name,
			Description: "",
			City:        "",
			PriceFrom:   0,
			Rating:      0,
		}
		if err := tx.Create(&master).Error; err != nil {
			tx.Rollback()
			http.Error(w, "Error creating master profile", http.StatusInternalServerError)
			return
		}
	} else if req.Role == "client" {
		client := models.Client{
			UserID: user.ID,
			Name:   req.Name,
			Phone:  "",
		}
		if err := tx.Create(&client).Error; err != nil {
			tx.Rollback()
			http.Error(w, "Error creating client profile", http.StatusInternalServerError)
			return
		}
	}

	tx.Commit()

	json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
		"userId": user.ID,
	})
}

// Вход
func Login(w http.ResponseWriter, r *http.Request) {
	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	db := config.GetDB()

	var user models.User
	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// Проверка пароля
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		http.Error(w, "Wrong password", http.StatusUnauthorized)
		return
	}

	// Генерация JWT токена
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "supersecret123"
	}

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"token":  tokenString,
		"role":   user.Role,
		"userId": user.ID,
	})
}
