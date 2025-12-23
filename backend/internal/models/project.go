package models

import (
	"time"
)

type Project struct {
	ID             string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	ClientID       string `gorm:"type:uuid;not null"`
	Title          string `gorm:"not null"`
	Description    string
	FurnitureType  string `gorm:"not null"` // тип мебели
	Budget         int
	Deadline       time.Time
	City           string
	Status         string `gorm:"default:'published'"` // published, assigned, completed
	AssignedMaster string `gorm:"type:uuid"`           // ID мастера
	CreatedAt      time.Time
	UpdatedAt      time.Time

	// Связи
	Client    *Client     `gorm:"foreignKey:ClientID"`
	Master    *Master     `gorm:"foreignKey:AssignedMaster"`
	Responses []*Response `gorm:"foreignKey:ProjectID"`
}
