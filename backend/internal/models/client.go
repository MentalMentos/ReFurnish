package models

import "time"

type Client struct {
	ID        string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID    string `gorm:"type:uuid;not null"`
	Name      string
	Phone     string
	CreatedAt time.Time

	// Связи
	User     *User      `gorm:"foreignKey:UserID"`
	Projects []*Project `gorm:"foreignKey:ClientID"`
}
