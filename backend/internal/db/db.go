package db

import (
	"database/sql"
	"os"

	_ "github.com/lib/pq"
)

func Connect() *sql.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://refurnish:pass@localhost:5432/refurnish?sslmode=disable"
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		panic(err)
	}
	return db
}
