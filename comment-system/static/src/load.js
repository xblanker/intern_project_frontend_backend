let currentPage = 1;
const pageSize = 5;
let totalComments = 0;

async function loadComments(page) {
    currentPage = page;
    try {
        const response = await fetch(`http://localhost:8080/comment/get?page=${page}&size=${pageSize}`);
        const result = await response.json();
        
        if (result.code !== 0) {
            throw new Error(result.msg || '未知错误');
        }
        
        totalComments = result.data.total;
        displayComments(result.data.comments);
        updatePaginationControls();

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
        
        const displayDate = new Date(comment.created_at).toLocaleString();

        commentElement.innerHTML = `
            <div>
                <img src='https://pic4.zhimg.com/v2-bf5f58e7b583cd69ac228db9fdff377f_r.jpg' 
                     class='comment-avatar' alt='${comment.name}' />
                <div class='comment-content'>
                    <div>
                        <span class='comment-meta'>${comment.name}</span>
                        <span class='comment-date'>${displayDate}</span>
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
        loadComments(currentPage); 
    })
    .catch(error => {
        console.error('删除评论错误:', error);
        alert('删除评论失败: ' + error.message);
    });
}

function setupPagination() {
    const paginationContainer = document.getElementById('pagination-controls');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = `
        <button id="prev-button">&laquo; 上一页</button>
        <span id="page-info"></span>
        <button id="next-button">下一页 &raquo;</button>
    `;

    document.getElementById('prev-button').addEventListener('click', () => {
        if (currentPage > 1) {
            loadComments(currentPage - 1);
        }
    });

    document.getElementById('next-button').addEventListener('click', () => {
        const totalPages = Math.ceil(totalComments / pageSize);
        if (currentPage < totalPages) {
            loadComments(currentPage + 1);
        }
    });
}

function updatePaginationControls() {
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const pageInfo = document.getElementById('page-info');

    if (!prevButton || !nextButton || !pageInfo) return;

    const totalPages = Math.ceil(totalComments / pageSize);

    if (totalPages <= 0) {
        pageInfo.textContent = '暂无评论';
    } else {
        pageInfo.textContent = `第 ${currentPage} / ${totalPages} 页 (共 ${totalComments} 条)`;
    }

    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
}

document.addEventListener('DOMContentLoaded', () => {
    setupPagination();
    loadComments(1);
});