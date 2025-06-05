package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

var db *sql.DB

func InitDB(database *sql.DB) {
	db = database
}

type Comment struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
}

type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

// 获取评论
func GetCommentsHandler(c *gin.Context) {
	// 参数验证
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	size, err := strconv.Atoi(c.DefaultQuery("size", "10"))
	if err != nil || size < -1 {
		size = 10
	}

	// 查询总数
	var total int
	countQuery := "SELECT COUNT(*) FROM comments"
	err = db.QueryRow(countQuery).Scan(&total)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "查询总数失败: " + err.Error(),
		})
		return
	}

	// 构建查询
	query := "SELECT id, name, content, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS created_at FROM comments"
	args := []interface{}{}

	// 始终排序
	query += " ORDER BY created_at DESC"

	// 分页处理
	if size != -1 {
		offset := (page - 1) * size
		query += " LIMIT $1 OFFSET $2"
		args = append(args, size, offset)
	}

	// 执行查询
	rows, err := db.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  "查询评论失败: " + err.Error(),
		})
		return
	}
	defer rows.Close()

	// 处理结果
	var comments []Comment
	for rows.Next() {
		var comment Comment
		if err := rows.Scan(
			&comment.ID,
			&comment.Name,
			&comment.Content,
			&comment.CreatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"code": 500,
				"msg":  "解析评论失败: " + err.Error(),
			})
			return
		}
		comments = append(comments, comment)
	}

	// 返回标准响应结构
	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"msg":  "success",
		"data": gin.H{
			"total":    total,
			"comments": comments,
		},
	})
}

// 添加评论
func AddCommentHandler(c *gin.Context) {
	var newComment Comment
	if err := c.ShouldBindJSON(&newComment); err != nil {
		c.JSON(http.StatusOK, Response{Code: 400, Msg: "Invalid request"})
		return
	}

	// 插入数据库
	var id int
	err := db.QueryRow(
		"INSERT INTO comments (name, content, created_at) VALUES ($1, $2, $3) RETURNING id",
		newComment.Name, newComment.Content, newComment.CreatedAt,
	).Scan(&id)
	if err != nil {
		c.JSON(http.StatusOK, Response{Code: 500, Msg: err.Error()})
		return
	}

	newComment.ID = id
	c.JSON(http.StatusOK, Response{
		Code: 0,
		Msg:  "Comment added",
		Data: newComment,
	})
}

// 删除评论
func DeleteCommentHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Query("id"))
	if err != nil || id <= 0 {
		c.JSON(http.StatusOK, Response{Code: 400, Msg: "Invalid ID"})
		return
	}

	result, err := db.Exec("DELETE FROM comments WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusOK, Response{Code: 500, Msg: err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusOK, Response{Code: 404, Msg: "Comment not found"})
		return
	}

	c.JSON(http.StatusOK, Response{
		Code: 0,
		Msg:  "Comment deleted",
		Data: nil,
	})
}
