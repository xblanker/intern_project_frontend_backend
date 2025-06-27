import { COMMENT_ADD } from "./assets/const";

async function AddComment({ name, onSuccess }: { name: string; onSuccess: () => void; }) {
  const textInput = document.getElementById('textInput') as HTMLInputElement;
  const content = textInput.value;
  if (content === '') {
    alert('Text input cannot be empty');
    return;
  }

  if (name === '') {
    name = '小黑子';
  }

  try {
    const response = await fetch(COMMENT_ADD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content, created_at: new Date().toISOString() })
    });

    const result = await response.json();
    if (result.code !== 0) {
      alert(`操作失败: ${result.msg}`);
      throw new Error(result.msg);
    }
    
    textInput.value = '';
    (document.getElementById('nameInput') as HTMLInputElement).value = '';
    onSuccess();
    
  } catch (error) {
    console.error('添加评论失败:', error);
  }
}

export default AddComment;