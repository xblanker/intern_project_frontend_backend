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
  catch  {
    alert('添加评论失败:');
  };
}

export default AddComment