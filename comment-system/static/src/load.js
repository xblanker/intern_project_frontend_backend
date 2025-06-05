async function loadComments() {
    try {
        const response = await fetch('http://localhost:8080/comment/get');
        const result = await response.json();
        
        // 检查业务状态码
        if (result.code !== 0) {
            throw new Error(result.msg || '未知错误');
        }
        
        // 正确的数据结构访问
        displayComments(result.data.comments);
    } catch (error) {
        console.error('加载评论错误:', error);
        alert('加载评论失败: ' + error.message);
    }
}

function displayComments(comments) {
    const commentsContainer = document.getElementById('commentlist');
    commentsContainer.innerHTML = '';
    
    if (!comments || comments.length === 0) {
        commentsContainer.innerHTML = '<div class="no-comments">No Comments Yet</div>';
        return;
    }
    
    comments.forEach(comment => {
        const commentElement = document.createElement('li');
        commentElement.className = 'comment-item';
        
        commentElement.innerHTML = `
            <div>
                <img src='https://pic4.zhimg.com/v2-bf5f58e7b583cd69ac228db9fdff377f_r.jpg' 
                     class='comment-avatar' alt='${comment.name}' />
                <div class='comment-content'>
                    <div>
                        <span class='comment-meta'>${comment.name}</span>
                        <span class='comment-date'>${comment.created_at}</span>
                    </div>
                    <p>${comment.content}</p>
                    <div class='comment-delete'>
                        <button id = 'deleteButton' onclick="deleteComment(${comment.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
        commentsContainer.appendChild(commentElement);
    });
}

function deleteComment(commentId) {
    if (!confirm('确定要删除这条评论吗？')) {
        return;
    }
    
    fetch(`http://localhost:8080/comment/delete?id=${commentId}`, {
        method: 'POST',
    })
    .then(response => response.json())
    .then(result => {
        if (result.code !== 0) {
            throw new Error(result.msg || '删除失败');
        }
        alert('评论已删除');
        loadComments(); // 重新加载评论列表
    })
    .catch(error => {
        console.error('删除评论错误:', error);
        alert('删除评论失败: ' + error.message);
    });
}



// 页面加载时调用
document.addEventListener('DOMContentLoaded', () => {
    loadComments();
});