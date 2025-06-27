import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import AddComment from './App.tsx'
import DateTimeDisplay from './date.tsx'
import { CommentSection } from './CommentSection.tsx'
import './index.css'

const profilePhoto: string = 'https://pic4.zhimg.com/v2-bf5f58e7b583cd69ac228db9fdff377f_r.jpg'

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCommentAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <StrictMode>
      <div>
        <h1 style={{ textAlign: 'center' }}>Welcome To Xanadu`s Comment</h1>
      </div>
      <Input_Area onCommentAdded={handleCommentAdded} />
      <CommentSection refreshTrigger={refreshTrigger} />
    </StrictMode>
  );
}

function Input_Area({ onCommentAdded }: { onCommentAdded: () => void }) {
  return (
    <div className='inputarea'>
      <img src={profilePhoto} alt={'小黑子'}
        style={{ width: '40px', height: '40px', borderRadius: '50%' }} />

      <DateTimeDisplay />

      <input type="text" placeholder="Please enter your name" id="nameInput" />
      <input type="text" placeholder="Please follow the Community Guidelines" id="textInput" onKeyUpCapture={
        (e) => {
          if (e.key === 'Enter') {
            const name: string = (document.getElementById('nameInput') as HTMLInputElement).value;
            AddComment({ name, onSuccess: onCommentAdded });
          }
        }
      } />

      <button
        id="submitButton"
        onClick={() => {
          const name: string = (document.getElementById('nameInput') as HTMLInputElement).value;
          AddComment({ name, onSuccess: onCommentAdded });
        }}
      >
        Submit
      </button>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />);