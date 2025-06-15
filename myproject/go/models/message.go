package models

import "time"

type MessageType string

const (
	Text  MessageType = "text"
	Image MessageType = "image"
)

type Message struct {
	ID             uint        `gorm:"primaryKey" json:"id"`
	ConversationID uint        `json:"conversation_id"`
	Role           string      `json:"role"` // "user" or "assistant"
	Type           MessageType `json:"type"`
	Content        string      `json:"content"` // 文本内容或图片Base64
	CreatedAt      time.Time   `json:"created_at"`
}