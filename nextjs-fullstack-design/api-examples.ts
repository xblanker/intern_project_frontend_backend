// API Route 实现示例：替代 Go 后端功能

// 1. 用户认证 API - 登录
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByUsername } from '@/lib/db/queries/users';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 参数验证
    if (!username || !password) {
      return NextResponse.json(
        { code: 400, msg: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await findUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { code: 401, msg: '账号或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { code: 401, msg: '账号或密码错误' },
        { status: 401 }
      );
    }

    // 创建 JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 设置 HTTP-only cookie
    const response = NextResponse.json({
      code: 0,
      msg: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.username
        }
      }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { code: 500, msg: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 2. 用户注册 API
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createUser, findUserByUsername } from '@/lib/db/queries/users';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 参数验证
    if (!username || !password) {
      return NextResponse.json(
        { code: 400, msg: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { code: 400, msg: '密码至少需要6个字符' },
        { status: 400 }
      );
    }

    // 检查用户是否已存在
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { code: 409, msg: '用户名已存在' },
        { status: 409 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const newUser = await createUser({
      username,
      password: hashedPassword
    });

    return NextResponse.json({
      code: 0,
      msg: '注册成功',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { code: 500, msg: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 3. 聊天室管理 API
// src/app/api/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth/middleware';
import { getRooms, createRoom } from '@/lib/db/queries/rooms';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateToken(request);
    if (!user) {
      return NextResponse.json(
        { code: 401, msg: '未授权访问' },
        { status: 401 }
      );
    }

    const rooms = await getRooms();
    
    return NextResponse.json({
      code: 0,
      msg: 'Success',
      data: rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { code: 500, msg: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateToken(request);
    if (!user) {
      return NextResponse.json(
        { code: 401, msg: '未授权访问' },
        { status: 401 }
      );
    }

    const { roomName } = await request.json();
    
    if (!roomName || roomName.trim().length === 0) {
      return NextResponse.json(
        { code: 400, msg: '房间名称不能为空' },
        { status: 400 }
      );
    }

    const newRoom = await createRoom({
      name: roomName.trim(),
      createdBy: user.userId
    });

    return NextResponse.json({
      code: 0,
      msg: '房间创建成功',
      data: { roomId: newRoom.id }
    });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { code: 500, msg: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 4. 消息管理 API
// src/app/api/rooms/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth/middleware';
import { getMessagesForRoom, createMessage } from '@/lib/db/queries/messages';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateToken(request);
    if (!user) {
      return NextResponse.json(
        { code: 401, msg: '未授权访问' },
        { status: 401 }
      );
    }

    const roomId = parseInt(params.id);
    if (isNaN(roomId)) {
      return NextResponse.json(
        { code: 400, msg: '无效的房间ID' },
        { status: 400 }
      );
    }

    const messages = await getMessagesForRoom(roomId);
    
    return NextResponse.json({
      code: 0,
      msg: 'Messages retrieved successfully',
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { code: 500, msg: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateToken(request);
    if (!user) {
      return NextResponse.json(
        { code: 401, msg: '未授权访问' },
        { status: 401 }
      );
    }

    const roomId = parseInt(params.id);
    if (isNaN(roomId)) {
      return NextResponse.json(
        { code: 400, msg: '无效的房间ID' },
        { status: 400 }
      );
    }

    const { content, profile } = await request.json();
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { code: 400, msg: '消息内容不能为空' },
        { status: 400 }
      );
    }

    const newMessage = await createMessage({
      roomId,
      userId: user.userId,
      content: content.trim(),
      profile: profile || 0
    });

    return NextResponse.json({
      code: 0,
      msg: '消息发送成功',
      data: newMessage
    });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json(
      { code: 500, msg: '服务器内部错误' },
      { status: 500 }
    );
  }
}