// internal/handlers/auth.go
package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"refurnish/internal/config"
	"refurnish/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Register - регистрация пользователя
func Register(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Phone    string `json:"phone"`
		Role     string `json:"role"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Неверный формат данных", http.StatusBadRequest)
		return
	}

	// Валидация
	if req.Name == "" || req.Email == "" || req.Password == "" || req.Role == "" {
		http.Error(w, "Заполните все обязательные поля", http.StatusBadRequest)
		return
	}

	if req.Role != "client" && req.Role != "master" {
		http.Error(w, "Роль должна быть 'client' или 'master'", http.StatusBadRequest)
		return
	}

	db := config.GetDB()

	// Проверяем существование пользователя
	var existingUser models.User
	if err := db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		http.Error(w, "Пользователь с таким email уже существует", http.StatusConflict)
		return
	}

	// Хешируем пароль
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Ошибка обработки пароля", http.StatusInternalServerError)
		return
	}

	// Создаем пользователя
	user := models.User{
		Email:    req.Email,
		Password: string(hashedPassword),
		Role:     req.Role,
	}

	if err := db.Create(&user).Error; err != nil {
		http.Error(w, "Ошибка создания пользователя", http.StatusInternalServerError)
		return
	}

	// Создаем профиль
	if req.Role == "client" {
		client := models.Client{
			UserID: user.ID,
		}
		db.Create(&client)
	} else if req.Role == "master" {
		master := models.Master{
			UserID: user.ID,
			City:   "",
		}
		db.Create(&master)
	}

	// СОЗДАЕМ JWT ТОКЕН (ВАЖНО!)
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"email":   user.Email,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte("your-secret-key-change-in-production"))
	if err != nil {
		log.Printf("Ошибка создания токена: %v", err)
		http.Error(w, "Ошибка создания токена", http.StatusInternalServerError)
		return
	}

	// Возвращаем полный ответ с токеном
	response := map[string]interface{}{
		"status":  "ok",
		"token":   tokenString,
		"userId":  user.ID,
		"user_id": user.ID, // дублируем для совместимости
		"role":    user.Role,
		"email":   user.Email,
		"message": "Регистрация успешна",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Login - вход пользователя
func Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Неверный формат данных", http.StatusBadRequest)
		return
	}

	db := config.GetDB()

	// Ищем пользователя
	var user models.User
	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			http.Error(w, "Пользователь не найден", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Ошибка базы данных", http.StatusInternalServerError)
		return
	}

	// Проверяем пароль
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		http.Error(w, "Неверный пароль", http.StatusUnauthorized)
		return
	}

	// Создаем JWT токен
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"email":   user.Email,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte("your-secret-key-change-in-production"))
	if err != nil {
		log.Printf("Ошибка создания токена: %v", err)
		http.Error(w, "Ошибка создания токена", http.StatusInternalServerError)
		return
	}

	// Возвращаем ответ
	response := map[string]interface{}{
		"status":  "ok",
		"token":   tokenString,
		"userId":  user.ID,
		"user_id": user.ID,
		"role":    user.Role,
		"email":   user.Email,
		"message": "Вход выполнен успешно",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
