package main

import (
	"log"
	"net/http"
	"refurnish/internal/db"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"refurnish/internal/config"
	"refurnish/internal/handlers"
	"refurnish/internal/middleware"
)

func main() {
	// Инициализация базы данных
	_ = config.GetDB()

	db.RunMigrations()

	// Создание роутера
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:8080"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Public routes
	r.Group(func(r chi.Router) {
		// Auth
		r.Post("/api/auth/register", handlers.Register)
		r.Post("/api/auth/login", handlers.Login)

		// Public data
		r.Get("/api/masters", handlers.ListMasters)
		r.Get("/api/projects/open", handlers.OpenProjects)
	})

	// Protected routes (require authentication)
	r.Group(func(r chi.Router) {
		r.Use(auth.AuthMiddleware)

		// Master routes
		r.Route("/api/master", func(r chi.Router) {
			r.Put("/profile", handlers.UpdateMasterProfile)
			r.Post("/response", handlers.RespondToProject)
			r.Get("/responses", handlers.MyResponses)
			// r.Get("/profile", handlers.GetMasterProfile)
			// r.Get("/assigned-projects", handlers.MasterAssignedProjects)
		})

		// Client routes
		r.Route("/api/client", func(r chi.Router) {
			r.Post("/project", handlers.CreateProject)
			r.Get("/projects", handlers.MyProjects)
			//r.Put("/project/{id}", handlers.EditProject)
			r.Post("/project/{id}/assign", handlers.AssignMaster)
			//r.Get("/project/{id}/responses", handlers.ProjectResponses)
			// r.Get("/profile", handlers.GetClientProfile)
		})

		// Common routes
		r.Route("/api/project", func(r chi.Router) {
			//r.Get("/{id}", handlers.GetProjectDetails) // Нужно реализовать
		})
	})

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Start server
	port := ":8080"
	log.Printf("Starting server on port %s", port)
	if err := http.ListenAndServe(port, r); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
