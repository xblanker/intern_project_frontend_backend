'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import "./globals.css";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/SetName');
  }, [router]);

  return null;
}