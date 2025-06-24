package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "chat_room_user"
	password = "secure_password"
	dbname   = "chat_room_db"
)

type Message struct {
	MessageId  int    `json:"message_id"`
	RoomId     int    `json:"room_id"`
	Profile_id int    `json:"profile_id"`
	Sender     string `json:"sender"`
	Content    string `json:"content"`
	Timestamp  string `json:"timestamp"`
}

type RoomPreviewInfo struct {
	RoomId      int            `json:"roomId"`
	RoomName    string         `json:"roomName"`
	LastSender  sql.NullString `json:"lastSender"`
	LastContent sql.NullString `json:"lastContent"`
	LastTime    sql.NullTime   `json:"lastTime"`
}

type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

type RoomAddRes struct {
	RoomId int `json:"room_id"`
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

	createTable()
	var tableExists bool
	err = db.QueryRow(`
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.tables
			WHERE table_name = 'rooms'
		)
	`).Scan(&tableExists)
	if err != nil {
		log.Fatal("Table check failed: ", err)
	}

	if !tableExists {
		log.Println("Table 'rooms' not found, creating...")
		createTable()
	} else {
		log.Println("Table 'rooms' already exists")
	}

	router := gin.Default()
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	router.POST("/room/add", AddNewRoom)
	router.GET("/room/list", GetRoomList)
	router.POST("/room/delete", DeleteRoom)
	router.POST("/room/message/add", AddMessage)
	router.GET("/room/message/list", GetMessageList)
	router.PUT("/room/message/update", RoomMessageUpdate)
	router.Run(":8080")
}

func AddNewRoom(c *gin.Context) {
	var room RoomPreviewInfo
	if err := c.ShouldBindJSON(&room); err != nil {
		c.JSON(400, Response{Code: 400, Msg: "Invalid input", Data: nil})
		return
	}
	var roomId int
	err := db.QueryRow(
		"INSERT INTO rooms (room_name) VALUES ($1) RETURNING room_id",
		room.RoomName,
	).Scan(&roomId)
	if err != nil {
		c.JSON(500, Response{Code: 500, Msg: "Failed to add room", Data: nil})
		return
	}

	room.RoomId = roomId
	c.JSON(200, RoomAddRes{
		RoomId: room.RoomId,
	})
	log.Printf("New room added: %+v", room)
}

func GetRoomList(c *gin.Context) {
	var total int
	roomCountQuery := "SELECT COUNT(*) FROM rooms"
	err := db.QueryRow(roomCountQuery).Scan(&total)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "总数统计失败：" + err.Error(),
		})
		return
	}

	query := `
			SELECT room_id, room_name, last_sender, last_content, last_time
			FROM rooms
			ORDER BY last_time DESC NULLS LAST
			`
	args := []interface{}{}

	rows, err := db.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "Falie while serch:" + err.Error(),
		})
		return
	}
	defer rows.Close()

	var roomList []RoomPreviewInfo
	for rows.Next() {
		var roomItem RoomPreviewInfo
		if err := rows.Scan(
			&roomItem.RoomId,
			&roomItem.RoomName,
			&roomItem.LastSender,
			&roomItem.LastContent,
			&roomItem.LastTime,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"code": 500,
				"msg":  "Faile while parsing" + err.Error(),
			})
			return
		}
		roomList = append(roomList, roomItem)
	}

	c.JSON(http.StatusOK, Response{
		Code: 0,
		Msg:  "Success",
		Data: roomList,
	})
}

func DeleteRoom(c *gin.Context) {
	roomId, err := strconv.Atoi((c.Query("roomTd")))
	if err != nil || roomId <= 0 {
		c.JSON(http.StatusOK, Response{Code: 400, Msg: "Invalid ID"})
		return
	}

	result, err := db.Exec("DELETE FROM rooms WHERE roomId = $1", roomId)
	if err != nil {
		c.JSON(http.StatusOK, Response{Code: 500, Msg: err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusOK, Response{Code: 400, Msg: "Room not found"})
		return
	}

	c.JSON(http.StatusOK, Response{
		Code: 0,
		Msg:  "Room deleted",
		Data: nil,
	})
}

func AddMessage(c *gin.Context) {
	var message struct {
		RoomId    int    `json:"roomId"`
		ProfileId int    `json:"profile_id"`
		Sender    string `json:"sender"`
		Content   string `json:"content"`
	}

	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusBadRequest, Response{Code: 400, Msg: "Invalid input: " + err.Error(), Data: nil})
		return
	}

	query := `
		INSERT INTO messages (room_id, profile_id, sender, content, "time")
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING message_id
	`
	var messageId int
	err := db.QueryRow(query, message.RoomId, message.ProfileId, message.Sender, message.Content).Scan(&messageId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Response{Code: 500, Msg: "Failed to add message: " + err.Error(), Data: nil})
		return
	}

	_, err = db.Exec(
		"UPDATE rooms SET  lastSender = $1, lastContent = $2, lastTime = NOW() WHERE room_id = $3",
		message.Sender, message.Content, message.RoomId,
	)
	if err != nil {
		log.Printf("Failed to update room preview: %v", err)
	}

	c.JSON(http.StatusOK, Response{
		Code: 0,
		Msg:  "Message added successfully",
		Data: gin.H{"messageId": messageId},
	})
	log.Printf("New message with ID %d added to room %d", messageId, message.RoomId)
}

func GetMessageList(c *gin.Context) {
	roomId := c.Query("roomId")
	if roomId == "" {
		c.JSON(400, Response{Code: 400, Msg: "Room ID is required", Data: nil})
		return
	}

	rows, err := db.Query("SELECT profile_id, sender, content, time FROM messages WHERE room_id = $1 ORDER BY time ASC", roomId)
	if err != nil {
		c.JSON(500, Response{Code: 500, Msg: "Failed to retrieve messages", Data: nil})
		return
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var msg Message
		if err := rows.Scan(&msg.Profile_id, &msg.Sender, &msg.Content, &msg.Timestamp); err != nil {
			c.JSON(500, Response{Code: 500, Msg: "Failed to scan message", Data: nil})
			return
		}
		messages = append(messages, msg)
	}

	c.JSON(200, Response{
		Code: 0,
		Msg:  "Messages retrieved successfully",
		Data: messages,
	})
}

func RoomMessageUpdate(c *gin.Context) {
	// 处理更新房间消息的逻辑
}

func createTable() {
	query := `
		CREATE TABLE IF NOT EXISTS rooms (
			room_id SERIAL PRIMARY KEY,
			room_name VARCHAR(100) NOT NULL UNIQUE,
			last_sender VARCHAR(100),
			last_content TEXT,
			last_time TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS messages (
			message_id SERIAL PRIMARY KEY,
			room_id INT NOT NULL,
			profile_id INT NOT NULL,
			sender VARCHAR(100) NOT NULL,
			content TEXT NOT NULL,
			"time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (room_id) REFERENCES rooms(room_id)
		);
	`
	_, err := db.Exec(query)
	if err != nil {
		log.Fatal("Failed to create tables: ", err)
	}
	log.Println("Tables created successfully")
}
