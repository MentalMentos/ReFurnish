package models

import (
	"time"
)

type Project struct {
	ID            string `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	Title         string `gorm:"not null"`
	Description   string
	FurnitureType string
	Budget        int
	Deadline      time.Time
	City          string
	Status        string `gorm:"default:'published'"`

	// ИСПРАВЛЕНО: используем *string для nullable UUID
	ClientID string `gorm:"type:uuid;not null"`
	Client   Client `gorm:"foreignKey:ClientID;references:ID"`

	// ИСПРАВЛЕНО: используем *string вместо string для nullable
	MasterID  *string `gorm:"type:uuid"`
	Master    *Master `gorm:"foreignKey:MasterID;references:ID"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
