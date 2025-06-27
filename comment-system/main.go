package main

import (
	"comment-system/handlers"
	"database/sql"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "comments_user"
	password = "secure_password"
	dbname   = "comments_db"
)

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

	handlers.InitDB(db)

	createTable()

	var tableExists bool
	err = db.QueryRow(`
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_name = 'comments'
        )
    `).Scan(&tableExists)

	if err != nil {
		log.Fatal("Table check failed: ", err)
	}

	if !tableExists {
		log.Println("Table 'comments' not found, creating...")
		createTable()
	} else {
		log.Println("Table 'comments' already exists")
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

	router.GET("/comment/get", handlers.GetCommentsHandler)
	router.POST("/comment/add", handlers.AddCommentHandler)
	router.POST("/comment/delete", handlers.DeleteCommentHandler)

	log.Println("Server started on :8080")
	log.Fatal(router.Run(":8080"))
}

func createTable() {
	query := `
        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `

	_, err := db.Exec(query)
	if err != nil {
		log.Fatalf("创建表失败: %v\n请执行以下命令修复:\nGRANT USAGE, CREATE ON SCHEMA public TO comments_user;", err)
	}
	log.Println("表 'comments' 创建成功")
}
