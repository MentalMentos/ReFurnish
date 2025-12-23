package models

import "time"

type Master struct {
	ID              string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID          string `gorm:"type:uuid;not null"`
	Name            string `gorm:"not null"`
	Description     string
	City            string
	Specializations []string `gorm:"type:text[]"`
	PriceFrom       int
	Rating          float64 `gorm:"default:0"`
	CreatedAt       time.Time

	// Связи
	User      *User       `gorm:"foreignKey:UserID"`
	Responses []*Response `gorm:"foreignKey:MasterID"`
}
