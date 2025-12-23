package models

import (
	"time"
)

type Response struct {
	ID        string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	ProjectID string `gorm:"type:uuid;not null"`
	MasterID  string `gorm:"type:uuid;not null"`
	Comment   string
	Price     int
	StartDate time.Time
	CreatedAt time.Time

	// Связи
	Project *Project `gorm:"foreignKey:ProjectID"`
	Master  *Master  `gorm:"foreignKey:MasterID"`
}
