'use client';

import styles from "./chat.module.css";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

const Profile = [ 'https://pic4.zhimg.com/v2-c5a0d0d57c1a85c6db56e918707f54a3_r.jpg',
                  'https://pic2.zhimg.com/v2-c2e79191533fdc7fced2f658eef987c9_r.jpg',
                  'https://pic4.zhimg.com/v2-bf5f58e7b583cd69ac228db9fdff377f_r.jpg',
                  'https://pic1.zhimg.com/v2-10e9368af9eb405c8844584ad3ad9dd8_r.jpg',
                  'https://picx.zhimg.com/50/v2-63e3500bfd25b6ae7013a6a3b6ce045b_720w.jpg',
                  'https://c-ssl.duitang.com/uploads/blog/202109/20/20210920000906_53764.png']

const RoomProfile = 'https://tse1-mm.cn.bing.net/th/id/OIP-C.0KyBJKAdIGi9SAQc_X62tQHaLr?cb=thvnextc2&rs=1&pid=ImgDetMain';

interface RoomEntryProps {
    roomId: number;
    roomName: string;
    lastSender: { String: string, Valid: boolean };
    lastContent: { String: string, Valid: boolean };
    lastTime: { Time: string, Valid: boolean };
}

interface MessageProps {
    roomId: number;
    roomName: string;
    messages: Array<{
        profile: number;
        sender: string;
        content: string;
        time: string;
    }>;
}

function RoomEntry ({rooms, onRoomClick, onRename, onDelete} : {rooms: RoomEntryProps[], onRoomClick: (roomId: number, roomName: string) => void, onRename: (roomId: number, currentName: string) => void, onDelete: (roomId: number) => void}) {
  const [openMenuFor, setOpenMenuFor] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu="room-actions"]')) {
        setOpenMenuFor(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={styles["chat-room-nav"]}>
      <div className={styles["sidebar-action"]}>
        <button type="button" className={styles["button"]} onClick={openOpenDiv}>
          <div className={styles["button-top"]}>New Chat</div>
          <div className={styles["button-bottom"]}></div>
          <div className={styles["button-base"]}></div>
        </button>
      </div>

      <div className={styles["chat-list"]}>
        {rooms.map((room) => (
          <div className={styles["chat-item"]} key={room.roomId}>
            <img src={RoomProfile} alt="Avatar" className={styles["avatar"]} />
            <div className={styles["chat-info"]}>
              <h3 onClick={() => onRoomClick(room.roomId, room.roomName)}>{room.roomName}</h3>
              <span className={styles["chat-message"]}>
                {room.lastSender.Valid ? room.lastSender.String : ''}:
                {room.lastContent.Valid ? room.lastContent.String : ''}</span>
              <span className={styles["chat-time"]}>{room.lastTime.Valid ? formatTimeToHoursMinutes(room.lastTime.Time) : ''}</span>
            </div>
            <div
              className={styles["chat-room-menu"]}
              data-menu="room-actions"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuFor(prev => (prev === room.roomId ? null : room.roomId));
              }}
              aria-label="Room actions"
              title="Room actions"
            >
              ···
              <div className={`${styles["menu-dropdown"]} ${openMenuFor === room.roomId ? styles["menu-open"] : ''}`}>
                <button
                  className={styles["menu-item"]}
                  onClick={(e) => { e.stopPropagation(); setOpenMenuFor(null); onRename(room.roomId, room.roomName); }}
                >
                  Rename room
                </button>
                <button
                  className={styles["menu-item"]}
                  onClick={(e) => { e.stopPropagation(); setOpenMenuFor(null); onDelete(room.roomId); }}
                >
                  Delete room
                </button>
              </div>
            </div>
          </div> 
        ))}
      </div>
    </div>
  ); 
  // Button From Uiverse.io by njesenberger
}

function formatTimeToHoursMinutes(isoString: string) {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function InputRoomNameArea({ onAddNewRoom }: { onAddNewRoom: (roomName: string) => void}) {
  const [roomNameInput, setRoomNameInput] = useState("");

  const handleAddNewRoom = () => {
    onAddNewRoom(roomNameInput);
    setRoomNameInput("");
    closeOpenDiv();
  }
  return (
    <div className={styles["open"]}>
      <div className={styles["roomName-input"]}>
        <h3>Please Enter the New Room Name</h3>
        <input
          type="text"
          className={styles["RoomNameInput"]}
          placeholder="Start new chat"
          value = {roomNameInput}
          onChange={(e) => setRoomNameInput(e.target.value)}
          onKeyUpCapture={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              handleAddNewRoom();
            }
            else if (e.key === 'Escape') {
              closeOpenDiv();
            }
          }}
        />
        <div className={styles["button-container"]}>
          <button className={styles["create-button"]} onClick={handleAddNewRoom}>Submit</button>
          <button className={styles["cancel-button"]} onClick={closeOpenDiv}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function openOpenDiv() {
  const openDiv = document.getElementsByClassName(styles.open)[0] as HTMLDivElement | undefined;
  if (openDiv) {
    openDiv.style.zIndex = "1000";
  }
  const roomNameInput = document.getElementsByClassName(styles.RoomNameInput)[0] as HTMLInputElement | undefined;
  if (roomNameInput) {
    roomNameInput.style.zIndex = "1001";
  }
}

function closeOpenDiv() {
  const openDiv = document.getElementsByClassName(styles.open)[0] as HTMLDivElement | undefined;
  if (openDiv) {
    openDiv.style.zIndex = "0";
  }
  const roomNameInput = document.getElementsByClassName(styles.RoomNameInput)[0] as HTMLInputElement | undefined;
  if (roomNameInput) {
    roomNameInput.style.zIndex = "0";
    roomNameInput.value = '';
  }
}

function MessageItem (props: MessageProps & { onAddNewComment: (content: string) => void}) {
  const [inputValue, setInputValue] = useState("");

  if (props.roomId === 0) {
    return <div className={styles["message-item"]}>Please select a room to chat.</div>;
  }

  const handlerSend = () => {
    if (inputValue.trim() === '') {
      alert("Message can't be empty");
      return
    }
    props.onAddNewComment(inputValue);
    setInputValue('');
  }
  return (
    <div className={styles["message-item"]}>
      <div className={styles["message-header"]}>
        <img src={RoomProfile} alt="Avatar" className={styles["avatar"]} />
        <h2>{props.roomName}</h2>
      </div>
      <div className={styles["message-list"]}>
        {props.messages.map((msg, index) => (
          <div key={index} className={styles["message"]}>
            <img src={Profile[msg.profile]} alt={`${msg.sender}'s avatar`} className={styles["avatar"]} />
            <div className={styles["message-content"]}>
              <div className={styles["message-info"]}>
                <span className={styles["message-sender"]}>{msg.sender}</span>
                <span className={styles["message-time"]}>{formatTimeToHoursMinutes(msg.time)}</span>
              </div>
              <p className={styles["message-text"]}>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={styles["message-input"]}>
        <input
          type="text"
          placeholder="Type a message..."
          className={styles["Inputarea"]}
          value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyUpCapture={
          (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              handlerSend();
            }
        }}/>
        <button className={styles["send-button"]} onClick={handlerSend}>
          <div className={styles["svg-wrapper-1"]}>
            <div className={styles["svg-wrapper"]}>
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

function ChatRoomComponent({ userName }: { userName: string }) {
  const [rooms, setRooms] = useState<RoomEntryProps[]>([]);
  const [currentRoom, setCurrentRoom] = useState<MessageProps | null>(null);
  
  const ROOM_LIST_REFRESH_INTERVAL = 1000;
  const MESSAGE_REFRESH_INTERVAL = 1000;

  useEffect(() => {
    document.title = `Chat Room | ${userName}`;
  }, [userName]);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/room/list", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.code === 0) {
        const fetchedRooms = result.data.map((room: RoomEntryProps) => ({
          ...room,
          lastSender: room.lastSender || { String: '', Valid: false },
          lastContent: room.lastContent || { String: '', Valid: false },
          lastTime: room.lastTime || { Time: '', Valid: false }
        }));
        setRooms(fetchedRooms);
      } else {
        console.error("Failed to fetch rooms:", result.msg);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchCurrentRoomMessages = async (roomId: number) => {
    if (!roomId) return;
    
    try {
      const response = await fetch(`/api/message/get?roomId=${roomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.code === 0) {
        setCurrentRoom(prev => {
          if (!prev || prev.roomId !== roomId) return prev;
          return {
            ...prev,
            messages: result.data || []
          };
        });
      } else {
        console.error("Failed to fetch messages:", result.msg);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
    
    const roomListInterval = setInterval(() => {
      fetchRooms();
    }, ROOM_LIST_REFRESH_INTERVAL);

    return () => clearInterval(roomListInterval);
  }, []);

  useEffect(() => {
    if (!currentRoom?.roomId) return;

    const messageInterval = setInterval(() => {
      fetchCurrentRoomMessages(currentRoom.roomId);
    }, MESSAGE_REFRESH_INTERVAL);

    return () => clearInterval(messageInterval);
  }, [currentRoom?.roomId]);

  const handleRoomClick = async (roomId: number, roomName: string) => {
    setCurrentRoom({
      roomId: roomId,
      roomName: roomName,
      messages: []
    });

    await fetchCurrentRoomMessages(roomId);
  }

  async function addNewRoom(roomName: string) {
    if (roomName.trim() === "") {
      alert("Please enter a room name.");
      return;
    }

    try {
      const response = await fetch("/api/room/add", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.code === 0) {
        const newRoom: RoomEntryProps = {
          roomId: result.data.roomId,
          roomName: roomName,
          lastSender: { String: '', Valid: false },
          lastContent: { String: '', Valid: false },
          lastTime: { Time: '', Valid: false },
        };
        setRooms(prevRooms => [newRoom, ...prevRooms]);
      } else {
        alert("Failed to add a new room: " + result.msg);
      }
    } catch (error) {
      console.error("Error adding new room:", error);
      alert("Error adding new room.");
    }
  }

  const addNewComment = async (content: string) => {
    if (!currentRoom) 
      return;

    let profileId = 0;
    if (userName === '蔡徐坤') {
      profileId = Profile.length - 1;
    } else {
      profileId = Math.floor(Math.random() * (Profile.length - 1));
    }

    try {
      const response = await fetch('/api/message/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: currentRoom.roomId,
          userName: userName,
          content: content
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.code === 0) {
        const newMessage: { profile: number, sender: string, content: string, time: string } = {
          profile: profileId,
          sender: userName,
          content: content,
          time: new Date().toISOString()
        };

        setCurrentRoom(prevRoom => {
          if (!prevRoom) return null;
          return {
            ...prevRoom,
            messages: [...prevRoom.messages, newMessage]
          };
        });
      } else {
        alert(`Error: ${result.msg}`);
      }
    } catch (error) {
      console.error("Error in addNewComment:", error);
      alert("An error occurred while sending the message.");
    }
  }

  const handleRename = async (roomId: number, currentName: string) => {
    const newName = prompt('Enter new room name', currentName);
    if (!newName || newName.trim() === '' || newName === currentName) return;
    try {
      const response = await fetch('/api/room/rename', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, newName: newName })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.code !== 0) {
        alert('Rename failed: ' + (result.msg || 'unknown error'));
        return;
      }
      setRooms(prev => prev.map(r => r.roomId === roomId ? { ...r, roomName: newName } : r));
      setCurrentRoom(prev => prev && prev.roomId === roomId ? { ...prev, roomName: newName } : prev);
    } catch (err) {
      console.error('Rename error', err);
      alert('Rename error');
    }
  };

  const handleDelete = async (roomId: number) => {
    if (!confirm('Delete this room? This cannot be undone.')) return;
    try {
      const response = await fetch('/api/room/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.code !== 0) {
        alert('Delete failed: ' + (result.msg || 'unknown error'));
        return;
      }
      setRooms(prev => prev.filter(r => r.roomId !== roomId));
      setCurrentRoom(prev => (prev && prev.roomId === roomId) ? null : prev);
    } catch (err) {
      console.error('Delete error', err);
      alert('Delete error');
    }
  };

  return (
      <div className={styles["chat-room"]}>
        <RoomEntry rooms={rooms} onRoomClick={handleRoomClick} onRename={handleRename} onDelete={handleDelete}/>
        <MessageItem 
            roomId={currentRoom?.roomId || 0}
            roomName={currentRoom?.roomName || ""}
            messages={currentRoom?.messages || []}
            onAddNewComment={addNewComment}
        />
        <InputRoomNameArea onAddNewRoom={addNewRoom}/>
      </div>
  );
}

export default function ChatRoom() {
    const [userName, setUserName] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
            setUserName(storedUserName);
        } else {
            router.push('/');
        }
    }, [router]);

    if (!userName) {
        return <div>Loading...</div>;
    }

    return <ChatRoomComponent userName={userName} />;
}