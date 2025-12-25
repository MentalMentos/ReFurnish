// main.go - ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ
package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"refurnish/internal/config"
	"refurnish/internal/handlers"
	authMiddleware "refurnish/internal/middleware"
)

func main() {
	_ = config.GetDB()

	r := chi.NewRouter()

	// Базовые middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)

	// ВАЖНО: CORS должен быть ПЕРВЫМ middleware!
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Requested-With"},
		ExposedHeaders:   []string{"Link", "Content-Length"},
		AllowCredentials: true,
		MaxAge:           86400, // 24 часа
	}))

	// Public routes
	r.Group(func(r chi.Router) {
		r.Post("/api/auth/register", handlers.Register)
		r.Post("/api/auth/login", handlers.Login)
		r.Get("/api/masters", handlers.ListMasters)
		r.Get("/api/projects/open", handlers.OpenProjects)
	})

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(authMiddleware.AuthMiddleware)

		// Master routes
		r.Route("/api/master", func(r chi.Router) {
			r.Put("/profile", handlers.UpdateMasterProfile)
			r.Post("/response", handlers.RespondToProject)
			r.Get("/responses", handlers.MyResponses)
			r.Get("/profile", handlers.GetMasterProfile)
			r.Get("/assigned-projects", handlers.MasterAssignedProjects)
		})

		// Client routes
		r.Route("/api/client", func(r chi.Router) {
			r.Post("/project", handlers.CreateProject)
			r.Get("/projects", handlers.MyProjects)
			r.Put("/project/{id}", handlers.EditProject)
			r.Post("/project/{id}/assign", handlers.AssignMaster)
			r.Get("/project/{id}/responses", handlers.ProjectResponses)
			r.Get("/profile", handlers.GetClientProfile)
		})

		// Common routes
		r.Route("/api/project", func(r chi.Router) {
			r.Get("/{id}", handlers.GetProjectDetails)
		})
	})

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Test endpoint
	r.Get("/api/test", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"message": "API работает!", "status": "ok"}`))
	})

	// Debug endpoint
	r.Post("/api/debug", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Debug: Headers: %v", r.Header)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"debug": "ok"}`))
	})

	port := "0.0.0.0:8080"
	log.Printf("🚀 Сервер запущен на порту %s", port)
	log.Printf("🌐 Frontend: http://localhost:5173")
	log.Printf("🔧 API: http://localhost:8080")
	log.Printf("✅ Health: http://localhost:8080/health")

	if err := http.ListenAndServe(port, r); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
