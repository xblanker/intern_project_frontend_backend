'use client';

import React from 'react';
import SetName from './SetName/page';
import "./globals.css";
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const handleLogin = (name: string) => {
    localStorage.setItem('userName', name);
    router.push('/ChatRoom');
  };

  return (
    <div className='root'>
      <SetName onLogin={handleLogin} />
    </div>
  );
}