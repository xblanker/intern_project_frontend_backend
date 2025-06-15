package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	
	"github.com/gin-gonic/gin"
	"your-app/models"
	"your-app/services"
)

func SendMessage(c *gin.Context) {
	conversationID := c.Param("conversationId")
	
	// 处理多模态输入
	text := c.PostForm("text")
	file, err := c.FormFile("image")
	
	var imageBase64 string
	if file != nil {
		// 保存图片并转换为Base64
		dst := fmt.Sprintf("./uploads/%s", file.Filename)
		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		imageBase64 = services.ImageToBase64(dst)
	}
	
	// 保存用户消息到数据库
	userMsg := models.Message{
		ConversationID: conversationID,
		Role:           "user",
		Type:           models.Text,
		Content:        text,
	}
	
	if imageBase64 != "" {
		userMsg.Type = models.Image
		userMsg.Content = imageBase64
	}
	
	// 保存消息（伪代码）
	db.Create(&userMsg)
	
	// 调用LLM服务
	llmResponse, err := services.CallLLMAPI(conversationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "LLM服务调用失败"})
		return
	}
	
	// 保存AI回复
	aiMsg := models.Message{
		ConversationID: conversationID,
		Role:           "assistant",
		Type:           models.Text,
		Content:        llmResponse,
	}
	db.Create(&aiMsg)
	
	c.JSON(http.StatusOK, gin.H{
		"userMessage": userMsg,
		"aiMessage":   aiMsg,
	})
}