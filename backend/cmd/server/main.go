package main

import (
	"log"
	"net/http"
	"refurnish/internal/db"
	"refurnish/internal/handlers"
	"refurnish/internal/middleware"

	"github.com/go-chi/chi/v5"
)

func main() {
	db.RunMigrations()

	r := chi.NewRouter()

	// Public
	r.Post("/auth/register", handlers.Register)
	r.Post("/auth/login", handlers.Login)

	r.Group(func(r chi.Router) {
		r.Use(middleware.JWT)

		// Клиент
		r.Post("/projects", handlers.CreateProject)
		r.Get("/projects/my", handlers.MyProjects)
		r.Put("/projects/{id}", handlers.EditProject)
		r.Patch("/projects/{id}/assign", handlers.AssignMaster)
		r.Get("/projects/{id}/responses", handlers.ProjectResponses)

		// Мастер
		r.Get("/projects/open", handlers.OpenProjects)
		r.Post("/responses", handlers.RespondToProject)
		r.Get("/responses/my", handlers.MyResponses)
	})

	log.Println("Backend started on :8080")
	http.ListenAndServe(":8080", r)
}
