import { format } from "date-fns";

const currentTime = new Date();
const formattedTime = format(currentTime, 'yyyy-MM-dd HH:mm');

async function AddComment({name, profilePhoto}:{name: string, profilePhoto:string}) {
  const textInput = document.getElementById('textInput') as HTMLInputElement;
  const content = textInput.value;
  if (content === '')
  {
    alert('Text input cannot be empty')
    return
  }

  if (name === '') 
  {
    name = '小黑子'
  }

  try {
    const response = await fetch('http://localhost:8080/comment/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content, created_at: formattedTime})
    });

    const result = await response.json();
    if (result.code !== 0) 
    {
      alert(`操作失败: ${result.msg}`);
      throw new Error(result.msg);
    }
    const newComment = result.data;

    const NewCommentPart = document.createElement('div')
    const UserPhoto = document.createElement('img')
    UserPhoto.className = 'comment-avatar'
    UserPhoto.src = profilePhoto
    UserPhoto.alt = name
    UserPhoto.style.width = '30px'
    UserPhoto.style.height = '30px'
    UserPhoto.style.borderRadius = '50%'
    NewCommentPart.appendChild(UserPhoto)

    const UserCommentContent = document.createElement('div')
    UserCommentContent.className = 'comment-content'

      const UserName = document.createElement('span')
      UserName.textContent = name
      UserName.className = 'comment-meta'
      UserCommentContent.appendChild(UserName)

      const UserDate = document.createElement('span')
      UserDate.textContent = formattedTime
      UserDate.className = 'comment-date'
      UserCommentContent.appendChild(UserDate)

      const UserComment = document.createElement('p')
      UserComment.textContent = textInput.value
      UserComment.style.marginLeft = '10px'
      textInput.value = '';
      (document.getElementById('nameInput') as HTMLInputElement).value = '';
      UserCommentContent.appendChild(UserComment)

      const DeleteButtonArea = document.createElement('div')
    DeleteButtonArea.className = 'comment-delete'
    const DeleteButton = document.createElement('button')
    DeleteButton.textContent = 'Delete'
    DeleteButton.id = 'deleteButton'
    DeleteButton.onclick = async () => {
      const commentItem = DeleteButton.closest('.comment-item')
      if (commentItem) {
        commentItem.remove()
        try {
          await fetch(`http://localhost:8080/comment/delete?id=${newComment.id}`, {
            method: 'POST'
          });
          commentItem.remove();
        } catch {
          alert('删除失败:');
        }
      }
    }
    DeleteButtonArea.appendChild(DeleteButton)
    UserCommentContent.appendChild(DeleteButtonArea)
    NewCommentPart.appendChild(UserCommentContent)

    const NewComment = document.createElement('li')
    NewComment.className = 'comment-item'
    NewComment.style.listStyle = 'none'
    NewComment.appendChild(NewCommentPart)

    const CommentList = document.getElementById('commentlist') as HTMLUListElement
    CommentList.appendChild(NewComment)
  }
  catch (error) {
    console.error('添加评论失败:', error);
  };
}

export default AddComment