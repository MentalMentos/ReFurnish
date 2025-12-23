package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Email     string `gorm:"uniqueIndex;not null"`
	Password  string `gorm:"not null"`
	Role      string `gorm:"not null"` // "client" или "master"
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`

	// Связи
	Client    *Client     `gorm:"foreignKey:UserID"`
	Master    *Master     `gorm:"foreignKey:UserID"`
	Projects  []*Project  `gorm:"foreignKey:ClientID"`
	Responses []*Response `gorm:"foreignKey:MasterID"`
}
