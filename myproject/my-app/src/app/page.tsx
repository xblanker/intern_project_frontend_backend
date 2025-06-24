'use client';

import React, { useState } from 'react';
import { ChatRoom } from "./pages/ChatRoom/ChatRoom";
import { SetName } from './pages/SetName/SetName';
import "./globals.css";

export default function Page() {
  const [userName, setUserName] = useState('');

  const handleLogin = (name: string) => {
    setUserName(name);
  };

  return (
    <div className='root'>
      {!userName ? (
        <SetName onLogin={handleLogin} />
      ) : (
        <ChatRoom userName={userName} />
      )}
    </div>
  );
}