'use client';

import "./ChatRoom.css";
import React, { useState } from "react";

// profile
const Profile = [ 'https://pic4.zhimg.com/v2-c5a0d0d57c1a85c6db56e918707f54a3_r.jpg',
                  'https://pic2.zhimg.com/v2-c2e79191533fdc7fced2f658eef987c9_r.jpg',
                  'https://pic4.zhimg.com/v2-bf5f58e7b583cd69ac228db9fdff377f_r.jpg',
                  'https://pic1.zhimg.com/v2-10e9368af9eb405c8844584ad3ad9dd8_r.jpg',
                  'https://picx.zhimg.com/50/v2-63e3500bfd25b6ae7013a6a3b6ce045b_720w.jpg',
                  'https://c-ssl.duitang.com/uploads/blog/202109/20/20210920000906_53764.png']

const RoomProfile = 'https://tse1-mm.cn.bing.net/th/id/OIP-C.0KyBJKAdIGi9SAQc_X62tQHaLr?cb=thvnextc2&rs=1&pid=ImgDetMain';

interface RoomEntryProps {
    roomId: number; // room id
    roomName: string; // room name
    lastSender: string; // the lasted User name
    lastContent: string; // content
    lastTime: string; // the lasted message time
}

// 单个聊天房间组件
interface MessageProps {
    roomId: number; // room id
    roomName: string; // room name
    messages: Array<{
        profile: number; // profile index
        sender: string; // sender name
        content: string; // message content
        time: string; // message time
    }>;
}

let RoomName: RoomEntryProps[] = [
    { roomId: 1, roomName: "General", lastSender: "Alice", lastContent: "Hello!aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", lastTime: "" },
    { roomId: 2, roomName: "Sports", lastSender: "Bob", lastContent: "Did you watch the game last night?", lastTime: "" },
    { roomId: 3, roomName: "Movies", lastSender: "Charlie", lastContent: "I loved the new movie!", lastTime: "" },
    { roomId: 4, roomName: "Music", lastSender: "David] ", lastContent: "Have you heard the latest album?", lastTime: "" },
]

let RoomRightNow: MessageProps = { roomId:0, roomName:"", messages:[{profile: 0, sender: "", content: "", time: ""}]}; // Initialize with default values
if (RoomName.length > 0) {
  RoomRightNow.roomId = RoomName[0].roomId; // 默认选中第一个房间
  RoomRightNow.roomName = RoomName[0].roomName;
}

function RoomEntry () {
  return (
    <div className="chat-room-nav">
      <div className="sidebar-action">
        <button type="button" className="button" onClick={openOpenDiv}>
          <div className="button-top">New Chat</div>
          <div className="button-bottom"></div>
          <div className="button-base"></div>
        </button>
      </div>

      <div className="chat-list">
        {RoomName.map((room) => (
          <div className="chat-item" key={room.roomId} onClick={() => handleRoomClick(room.roomId, room.roomName)}>
            <img src={RoomProfile} alt="Avatar" className="avatar" />
            <div className="chat-info">
              <h3>{room.roomName}</h3>
              <span className="chat-message">{room.lastContent}</span>
              <span className="chat-time"></span>
            </div>
          </div> 
        ))}
      </div>
    </div>
  ); 
  // Button From Uiverse.io by njesenberger
}

function handleRoomClick(roomId: number, roomName: string) {
  RoomRightNow.roomId = roomId;
  RoomRightNow.roomName = roomName;
  
  // here unsuccessfully 
  // try to update the last message info
}

function InputRoomNameArea() {
  const [roomId, setRoomId] = useState(0);
  function handleRoomIdChange() {
    setRoomId(roomId + 1);
  }

  return (
    <div className="open">
      <div className="roomName-input">
        <h3>Please Enter the New Room Name</h3>
        <input
          type="text"
          className="RoomNameInput"
          placeholder="Search or start new chat"
          onKeyUpCapture={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              addNewRoom();
              handleRoomIdChange();
            }
            else if (e.key === 'Escape') {
              closeOpenDiv();
            }
          }}
        />
        <div className="button-container">
          <button className="create-button" onClick={() =>{
            addNewRoom();
            handleRoomIdChange();
          }}>Submit</button>
          <button className="cancel-button" onClick={closeOpenDiv}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

async function addNewRoom() {
  const RoomNameInput = (document.getElementsByClassName("RoomNameInput")[0] as HTMLInputElement).value;
  if (RoomNameInput === "") {
    alert("Please enter a room name.");
    return;
  }

  try {
    const response = await fetch ("http://localhost:8080/room/add", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_name: RoomNameInput })
    })

    const result = await response.json();
    const NewRoomId = result.room_id;
    RoomName.push({
      roomId: NewRoomId,
      roomName: RoomNameInput,
      lastSender: "",
      lastContent: "",
      lastTime: "",
    })

    const chatList = document.getElementsByClassName("chat-list")[0];
    const newRoom = document.createElement("div");
    newRoom.className = "chat-item";
    newRoom.setAttribute("key", NewRoomId.toString());
    newRoom.innerHTML = `
      <img src="${RoomProfile}" alt="Avatar" class="avatar" />
      <div class="chat-info" >
      <h3>${RoomNameInput}</h3>
      <span class="chat-message"></span>
      <span class="chat-time"></span>
      </div>
    `;
    chatList.appendChild(newRoom);
  } catch (error) {
    console.error("Error adding new room:", error);
    alert("Failed to create room. Please try again.");
  }

  closeOpenDiv();
  // RoomEntry();
}

function openOpenDiv() {
  const openDiv = document.getElementsByClassName("open")[0] as HTMLDivElement;
  openDiv.style.zIndex = "1000";
  const roomNameInput = document.getElementsByClassName("RoomNameInput")[0] as HTMLInputElement;
  roomNameInput.style.zIndex = "1001";
}

function closeOpenDiv() {
  const openDiv = document.getElementsByClassName("open")[0] as HTMLDivElement;
  openDiv.style.zIndex = "0";
  const roomNameInput = document.getElementsByClassName("RoomNameInput")[0] as HTMLInputElement;
  roomNameInput.style.zIndex = "0";
  (document.getElementsByClassName("RoomNameInput")[0] as HTMLInputElement).value = '';
}

function MessageItem (props: MessageProps) {
  if (props.roomId === 0) {
    return <div className="message-item">Please select a room to chat.</div>;
  }
  return (
    <div className="message-item">
      <div className="message-header">
        <img src={RoomProfile} alt="Avatar" className="avatar" />
        <h2>{props.roomName}</h2>
      </div>
      <div className="message-list">
        {props.messages.map((msg, index) => (
          <div key={index} className="message">
            <img src={Profile[msg.profile]} alt={`${msg.sender}'s avatar`} className="avatar" />
            <div className="message-content">
              <div className="message-info">
                <span className="message-sender">{msg.sender}</span>
                <span className="message-time">{new Date(msg.time).toLocaleTimeString()}</span>
              </div>
              <p className="message-text">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="message-input">
        <input type="text" placeholder="Type a message..." className="Inputarea" onKeyUpCapture={
          (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              addNewComment(props.roomId, "蔡徐坤", (e.target as HTMLInputElement).value);
            }
        }}/>
        <button className="send-button" onClick={() => addNewComment(props.roomId, "蔡徐坤", (document.getElementsByClassName("Inputarea")[0] as HTMLInputElement).value)}>
          <div className="svg-wrapper-1">
            <div className="svg-wrapper">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path
                  fill="currentColor"
                  d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                ></path>
              </svg>
            </div>
          </div>
          <span>Send</span>
        </button>
      </div>
    </div>
  );
  // From Uiverse.io by adamgiebl
}

// add new comment
function addNewComment(roomId: number, sender: string, content: string) {
    const messageList = document.getElementsByClassName("message-list");

    if (content === "") {
        alert("Please enter a message before sending.");
        return;
    }

    var profileId = 0;
    if (sender === "蔡徐坤") {
      profileId = Profile.length - 1;
    }
    else {
      profileId = Math.floor(Math.random() * (Profile.length-1));
    }

    try {
      const response = fetch('http://localhost:8080/room/message/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, profile_id: profileId, sender, content })
      });
      response.then(res => res.json()).then(data => {
        if (data.code !== 0) {
          alert(`Error: ${data.msg}`);
          return;
        }
        
        const message = document.createElement("div");
        message.className = "message";
        message.innerHTML = `
            <img src="${Profile[profileId]}" alt="${sender}'s avatar" class="avatar">
            <div class="message-content">
                <div class="message-info">
                    <span class="message-sender">${sender}</span>
                    <span class="message-time">${new Date().toLocaleTimeString()}</span>
                </div>
                <p class="message-text">${content}</p>
            </div>
        `;

        (document.getElementsByClassName("Inputarea")[0] as HTMLInputElement).value = '';

        messageList[0].appendChild(message);
      }).catch(error => {
        console.error("Error adding new comment:", error);
        alert("Failed to send message. Please try again.");
      });
    }
    catch (error) {
        console.error("Error in addNewComment:", error);
        alert("An error occurred while sending the message.");
    }
}

export default function ChatRoom() {
  return (
      <div className="chat-room">
        <RoomEntry />
        <MessageItem 
            roomId={RoomRightNow.roomId}
            roomName={RoomRightNow.roomName}
            messages={[
                { profile: 2, sender: "Alice", content: RoomRightNow.roomName, time: "Right Now" }
            ]} 
        />
        <InputRoomNameArea />
      </div>
  );
}