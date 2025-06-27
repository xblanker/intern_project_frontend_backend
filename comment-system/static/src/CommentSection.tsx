import { useState, useEffect, useRef } from 'react';
import { COMMENT_GET, COMMENT_DEL } from './assets/const'

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(undefined);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

interface Comment {
    id: number;
    name: string;
    content: string;
    created_at: string;
}

const pageSize = 5;
const POLLING_INTERVAL = 1000;

export function CommentSection({ refreshTrigger }: { refreshTrigger: number }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalComments, setTotalComments] = useState(0);

    const loadComments = async (page: number) => {
        try {
            const response = await fetch(COMMENT_GET + `?page=${page}&size=${pageSize}`);
            const result = await response.json();

            if (result.code !== 0) throw new Error(result.msg);

            setComments(result.data.comments);
            setTotalComments(result.data.total);
        } catch (error) {
            console.error('加载评论错误:', error);
        }
    };

    const deleteComment = async (commentId: number) => {
        if (!confirm('确定要删除这条评论吗？')) 
            return;
        try {
            const response = await fetch(COMMENT_DEL + `?id=${commentId}`, { 
                method: 'POST' 
            });
            const result = await response.json();
            if (result.code !== 0) throw new Error(result.msg);
            alert('评论已删除');
            loadComments(currentPage);
        } catch (error) {
            console.error('删除评论错误:', error);
            alert('删除评论失败: ' + (error as Error).message);
        }
    };

    useEffect(() => {
        loadComments(currentPage);
    }, [currentPage, refreshTrigger]);

    useInterval(() => {
        loadComments(currentPage);
    }, POLLING_INTERVAL);


    const totalPages = Math.ceil(totalComments / pageSize);

    return (
        <div className="comment">
            <div>
                <h3 style={{ textAlign: 'center' }}>All Comment</h3>
            </div>
            <ul id="commentlist">
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <li key={comment.id} className="comment-item">
                             <div>
                                <img src='https://pic4.zhimg.com/v2-bf5f58e7b583cd69ac228db9fdff377f_r.jpg'
                                    className='comment-avatar' alt={comment.name} />
                                <div className='comment-content'>
                                    <div>
                                        <span className='comment-meta'>{comment.name}</span>
                                        <span className='comment-date'>{new Date(comment.created_at).toLocaleString()}</span>
                                    </div>
                                    <p>{comment.content}</p>
                                    <div className='comment-delete'>
                                        <button id='deleteButton' onClick={() => deleteComment(comment.id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))
                ) : (
                    <div className="no-comments">No Comment Yet</div>
                )}
            </ul>

            <div id="pagination-controls" className="pagination-controls">
                <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage <= 1}>
                    &laquo; Last
                </button>
                <span>
                    {totalComments > 0 ? `Page ${currentPage} / ${totalPages}` : 'No Comment Yet'}
                </span>
                <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage >= totalPages}>
                    Next &raquo;
                </button>
            </div>
        </div>
    );
}