function AddComment({name, profilePhoto}:{name: string, profilePhoto:string}) {
  if ((document.getElementById('textInput') as HTMLInputElement).value !== '') {
    if (name === '') {
      name = '小黑子'
    }
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

        const textInput = document.getElementById('textInput') as HTMLInputElement
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
      DeleteButton.onclick = () => {
        const commentItem = DeleteButton.closest('.comment-item')
        if (commentItem) {
          commentItem.remove()
        }
      }
      DeleteButtonArea.appendChild(DeleteButton)
      UserCommentContent.appendChild(DeleteButtonArea)

      const CommentList = document.getElementById('commentlist') as HTMLUListElement
      const NewComment = document.createElement('li')
      NewComment.className = 'comment-item'
      NewComment.style.listStyle = 'none'
      NewComment.appendChild(NewCommentPart)
      CommentList.appendChild(NewComment)
    NewCommentPart.appendChild(UserCommentContent)
    const Comment = document.getElementById('comment') as HTMLUListElement
    Comment.appendChild(NewCommentPart)
  }
  else {
    alert('textInput is null')
  }
}

export default AddComment