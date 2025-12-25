// internal/middleware/auth.go - ОБНОВЛЕННАЯ ВЕРСИЯ
package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware проверяет JWT токен
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Получаем заголовок Authorization
		authHeader := r.Header.Get("Authorization")

		log.Printf("🛡️  [AUTH] Проверка для: %s %s", r.Method, r.URL.Path)
		log.Printf("🛡️  [AUTH] Заголовок Authorization: %s", authHeader)

		if authHeader == "" {
			log.Printf("❌ [AUTH] Нет заголовка Authorization")
			http.Error(w, "Требуется авторизация", http.StatusUnauthorized)
			return
		}

		// Проверяем формат "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 {
			log.Printf("❌ [AUTH] Неверный формат заголовка. Частей: %d", len(parts))
			http.Error(w, "Неверный формат токена", http.StatusUnauthorized)
			return
		}

		if parts[0] != "Bearer" {
			log.Printf("❌ [AUTH] Неверная схема авторизации: %s (ожидается Bearer)", parts[0])
			http.Error(w, "Неверный формат токена", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]

		// Логируем только начало токена для безопасности
		if len(tokenString) > 10 {
			log.Printf("🛡️  [AUTH] Получен токен (первые 10 символов): %s...", tokenString[:10])
		} else {
			log.Printf("🛡️  [AUTH] Получен токен: %s", tokenString)
		}

		// Парсим токен
		log.Printf("🛡️  [AUTH] Парсим токен...")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Проверяем алгоритм подписи
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				log.Printf("❌ [AUTH] Неожиданный алгоритм подписи: %v", token.Header["alg"])
				return nil, jwt.ErrSignatureInvalid
			}

			// Секретный ключ (ДОЛЖЕН БЫТЬ ТОТ ЖЕ, ЧТО И В handlers/auth.go)
			secretKey := []byte("your-secret-key-change-in-production")
			log.Printf("🛡️  [AUTH] Используем секретный ключ длиной: %d", len(secretKey))

			return secretKey, nil
		})

		if err != nil {
			log.Printf("❌ [AUTH] Ошибка парсинга токена: %v", err)
			http.Error(w, "Неверный токен: "+err.Error(), http.StatusUnauthorized)
			return
		}

		if !token.Valid {
			log.Printf("❌ [AUTH] Токен невалиден")
			http.Error(w, "Неверный токен", http.StatusUnauthorized)
			return
		}

		// Извлекаем claims
		log.Printf("🛡️  [AUTH] Токен валиден, извлекаем claims...")
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			// Проверяем наличие user_id
			userID, ok1 := claims["user_id"].(string)
			userIdFloat, ok2 := claims["user_id"].(float64) // JSON числа становятся float64

			var finalUserID string

			if ok1 {
				finalUserID = userID
			} else if ok2 {
				finalUserID = string(int(userIdFloat)) // Конвертируем float64 в string
			} else {
				log.Printf("❌ [AUTH] Неверный токен: отсутствует user_id. Claims: %v", claims)
				http.Error(w, "Неверный токен: отсутствует user_id", http.StatusUnauthorized)
				return
			}

			// Добавляем user_id в контекст
			ctx := context.WithValue(r.Context(), "user_id", finalUserID)
			log.Printf("✅ [AUTH] user_id добавлен в контекст: %s", finalUserID)

			// Добавляем роль, если есть
			if role, ok := claims["role"].(string); ok {
				ctx = context.WithValue(ctx, "role", role)
				log.Printf("✅ [AUTH] role: %s", role)
			}

			r = r.WithContext(ctx)
		} else {
			log.Printf("❌ [AUTH] Не удалось извлечь claims из токена")
			http.Error(w, "Неверный токен", http.StatusUnauthorized)
			return
		}

		log.Printf("✅ [AUTH] Успешная аутентификация для %s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}
