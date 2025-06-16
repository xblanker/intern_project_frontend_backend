package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"your-app/models"
)

func CallLLMAPI(conversationID string) (string, error) {
	// 获取对话上下文
	var messages []models.Message
	db.Where("conversation_id = ?", conversationID).Find(&messages)
	
	// 构造多模态请求
	payload := map[string]interface{}{
		"model": "gpt-4-vision-preview",
		"messages": buildMessages(messages),
	}
	
	payloadBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(payloadBytes))
	req.Header.Set("Authorization", "Bearer "+os.Getenv("OPENAI_API_KEY"))
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	
	body, _ := ioutil.ReadAll(resp.Body)
	
	// 解析响应
	var result map[string]interface{}
	json.Unmarshal(body, &result)
	
	choices := result["choices"].([]interface{})
	message := choices[0].(map[string]interface{})["message"].(map[string]interface{})
	
	return message["content"].(string), nil
}

// 构建多模态消息
func buildMessages(messages []models.Message) []map[string]interface{} {
	var result []map[string]interface{}
	
	for _, msg := range messages {
		content := []interface{}{{"type": "text", "text": msg.Content}}
		
		if msg.Type == models.Image {
			content = append(content, map[string]interface{}{
				"type": "image_url",
				"image_url": map[string]string{
					"url": fmt.Sprintf("data:image/jpeg;base64,%s", msg.Content),
				},
			})
		}
		
		result = append(result, map[string]interface{}{
			"role":    msg.Role,
			"content": content,
		})
	}
	
	return result
}