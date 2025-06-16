package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "chat_room_user"
	password = "secure_password"
	dbname   = "chat_room_db"
)

type Message struct {
	MessageId int    `json:"message_id"`
	RoomId    int    `json:"room_id"`
	Sender    string `json:"sender"`
	Content   string `json:"content"`
	Timestamp string `json:"timestamp"`
}

type RoomPreviewInfo struct {
	RoomId          int    `json:"room_id"`
	RoomName        string `json:"room_name"`
	LastMessage     string `json:"last_message"`
	LastMessageTime string `json:"last_message_time"`
}

type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

var db *sql.DB

func main() {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	router := gin.Default()
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	})

	router.GET("/room/list", GetRoomList)
	router.POST("/room/create", DeleteRoom)
	router.POST("/room/message/add", AddMessage)
	router.GET("/room/message/list", GetMessageList)
	router.PUT("/room/message/update", RoomMessageUpdate)
	router.Run(":8080")
}

func GetRoomList(c *gin.Context) {

}

func DeleteRoom(c *gin.Context) {

}

func AddMessage(c *gin.Context) {
	// 处理添加消息的逻辑
}

func GetMessageList(c *gin.Context) {
	// 处理获取消息列表的逻辑
}

func RoomMessageUpdate(c *gin.Context) {
	// 处理更新房间消息的逻辑
}
