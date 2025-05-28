 import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AddComment from './App.tsx'
import './index.css'

const profilePhoto:string = 'https://pic4.zhimg.com/v2-bf5f58e7b583cd69ac228db9fdff377f_r.jpg'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div>
      <h1 style={{textAlign: 'center'}}>Welcome To Xanadu`s Comment</h1>
    </div>
    <Input_Area />
    <div className='comment'>
      <div>
        <h3 style={{textAlign: 'center'}}>
          All Comment
        </h3>
      </div>
      <ul id='commentlist'></ul>
    </div>
  </StrictMode>
)

function Input_Area() {
  return (
    <div className='inputarea'>
      <img src={profilePhoto} alt={'小黑子'} 
        style={{width: '40px', height: '40px', borderRadius: '50%'}} />

      <input type="text" placeholder="Please enter your name" id="nameInput" />
      <input type="text" placeholder="Please follow the Community Guidelines" id="textInput" onKeyUpCapture={
        (e) => {
          const name:string = (document.getElementById('nameInput') as HTMLInputElement).value;
          if (e.key === 'Enter') {
            AddComment({name, profilePhoto});
          }
        }
      }/>
      <button
        id="submitButton"
        onClick={() => AddComment({
          name: (document.getElementById('nameInput') as HTMLInputElement).value,
          profilePhoto: profilePhoto
        })}
      >
        Submit
      </button>
    </div>
  )
}


// Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass