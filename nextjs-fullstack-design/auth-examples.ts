// 认证中间件和组件示例

// src/lib/auth/middleware.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  userId: number;
  username: string;
}

export async function authenticateToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    // 尝试从 cookie 获取 token
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      // 尝试从 Authorization header 获取
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }
      const headerToken = authHeader.substring(7);
      if (!headerToken) {
        return null;
      }
    }

    const finalToken = token || request.headers.get('authorization')?.substring(7);
    if (!finalToken) {
      return null;
    }

    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET!) as AuthUser;
    return decoded;
  } catch (error) {
    console.error('Token authentication failed:', error);
    return null;
  }
}

// src/middleware.ts - Next.js 中间件
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  // 需要认证的路径
  const protectedPaths = ['/chat', '/profile'];
  const authApiPaths = ['/api/rooms', '/api/comments'];
  
  const { pathname } = request.nextUrl;
  
  // 检查是否需要认证
  const needsAuth = protectedPaths.some(path => pathname.startsWith(path)) ||
                   authApiPaths.some(path => pathname.startsWith(path));
  
  if (!needsAuth) {
    return NextResponse.next();
  }
  
  // 获取认证 token
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    // API 路径返回 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { code: 401, msg: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 页面路径重定向到登录
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch (error) {
    // Token 无效
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { code: 401, msg: 'Token 无效' },
        { status: 401 }
      );
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/chat/:path*', '/profile/:path*', '/api/rooms/:path*', '/api/comments/:path*']
};

// src/hooks/useAuth.ts - 认证 Hook
'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 检查本地存储的用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.code === 0) {
        const userData = data.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.code === 0) {
        // 注册成功后自动登录
        return await login(username, password);
      }
      
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    
    // 调用注销 API 清除服务器端 cookie
    fetch('/api/auth/logout', {
      method: 'POST',
    }).catch(console.error);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// src/components/auth/LoginForm.tsx - 登录表单组件
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('请填写用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      
      if (success) {
        router.push('/chat');
      } else {
        setError('用户名或密码错误');
      }
    } catch (error) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">登录</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            用户名
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            密码
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <a href="/register" className="text-blue-500 hover:text-blue-600">
          还没有账号？注册
        </a>
      </div>
    </div>
  );
}