// 数据库查询函数和类型定义示例

// src/lib/types/index.ts
export interface User {
  id: number;
  username: string;
  password: string;
  createdAt: Date;
}

export interface Room {
  id: number;
  name: string;
  createdBy: number;
  createdAt: Date;
  lastSender?: string;
  lastContent?: string;
  lastTime?: Date;
}

export interface Message {
  id: number;
  roomId: number;
  userId: number;
  content: string;
  profile: number;
  createdAt: Date;
  user?: {
    username: string;
  };
}

export interface Comment {
  id: number;
  name: string;
  content: string;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data?: T;
}

// src/lib/db/index.ts - 数据库连接
import { Pool } from 'pg';

let pool: Pool;

export function getDB(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'chat_room_user',
      password: process.env.DB_PASSWORD || 'secure_password',
      database: process.env.DB_NAME || 'chat_room_db',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
}

// src/lib/db/queries/users.ts
import { getDB } from '../index';
import type { User } from '@/lib/types';

export async function findUserByUsername(username: string): Promise<User | null> {
  const db = getDB();
  const result = await db.query(
    'SELECT id, username, password, created_at as "createdAt" FROM users WHERE username = $1',
    [username]
  );
  
  return result.rows[0] || null;
}

export async function createUser(data: {
  username: string;
  password: string;
}): Promise<User> {
  const db = getDB();
  const result = await db.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, password, created_at as "createdAt"',
    [data.username, data.password]
  );
  
  return result.rows[0];
}

export async function getUserById(id: number): Promise<User | null> {
  const db = getDB();
  const result = await db.query(
    'SELECT id, username, password, created_at as "createdAt" FROM users WHERE id = $1',
    [id]
  );
  
  return result.rows[0] || null;
}

// src/lib/db/queries/rooms.ts
import { getDB } from '../index';
import type { Room } from '@/lib/types';

export async function getRooms(): Promise<Room[]> {
  const db = getDB();
  const result = await db.query(`
    SELECT 
      r.room_id as id,
      r.room_name as name,
      r.last_sender as "lastSender",
      r.last_content as "lastContent",
      r.last_time as "lastTime"
    FROM rooms r
    ORDER BY r.last_time DESC NULLS LAST, r.room_id DESC
  `);
  
  return result.rows;
}

export async function createRoom(data: {
  name: string;
  createdBy: number;
}): Promise<Room> {
  const db = getDB();
  const result = await db.query(
    'INSERT INTO rooms (room_name) VALUES ($1) RETURNING room_id as id, room_name as name',
    [data.name]
  );
  
  return result.rows[0];
}

export async function deleteRoom(id: number): Promise<boolean> {
  const db = getDB();
  
  // 开始事务
  await db.query('BEGIN');
  
  try {
    // 首先删除房间内的所有消息
    await db.query('DELETE FROM messages WHERE room_id = $1', [id]);
    
    // 然后删除房间
    const result = await db.query('DELETE FROM rooms WHERE room_id = $1', [id]);
    
    await db.query('COMMIT');
    
    return result.rowCount > 0;
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

export async function updateRoomName(id: number, newName: string): Promise<boolean> {
  const db = getDB();
  const result = await db.query(
    'UPDATE rooms SET room_name = $1 WHERE room_id = $2',
    [newName, id]
  );
  
  return result.rowCount > 0;
}

// src/lib/db/queries/messages.ts
import { getDB } from '../index';
import type { Message } from '@/lib/types';

export async function getMessagesForRoom(roomId: number): Promise<Message[]> {
  const db = getDB();
  const result = await db.query(`
    SELECT 
      m.message_id as id,
      m.room_id as "roomId",
      m.user_id as "userId",
      m.profile,
      m.content,
      m.time as "createdAt",
      u.username as sender
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = $1
    ORDER BY m.time ASC
  `, [roomId]);
  
  return result.rows;
}

export async function createMessage(data: {
  roomId: number;
  userId: number;
  content: string;
  profile: number;
}): Promise<Message> {
  const db = getDB();
  
  // 开始事务
  await db.query('BEGIN');
  
  try {
    // 插入消息
    const messageResult = await db.query(`
      INSERT INTO messages (room_id, user_id, profile, content)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        message_id as id,
        room_id as "roomId",
        user_id as "userId",
        profile,
        content,
        time as "createdAt"
    `, [data.roomId, data.userId, data.profile, data.content]);
    
    // 获取用户名
    const userResult = await db.query(
      'SELECT username FROM users WHERE id = $1',
      [data.userId]
    );
    
    // 更新房间的最后消息信息
    await db.query(`
      UPDATE rooms 
      SET 
        last_sender = $1,
        last_content = $2,
        last_time = CURRENT_TIMESTAMP
      WHERE room_id = $3
    `, [userResult.rows[0].username, data.content, data.roomId]);
    
    await db.query('COMMIT');
    
    const message = messageResult.rows[0];
    message.sender = userResult.rows[0].username;
    
    return message;
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

// src/lib/db/queries/comments.ts
import { getDB } from '../index';
import type { Comment } from '@/lib/types';

export async function getComments(): Promise<Comment[]> {
  const db = getDB();
  const result = await db.query(`
    SELECT 
      id,
      name,
      content,
      created_at as "createdAt"
    FROM comments
    ORDER BY created_at DESC
  `);
  
  return result.rows;
}

export async function createComment(data: {
  name: string;
  content: string;
}): Promise<Comment> {
  const db = getDB();
  const result = await db.query(`
    INSERT INTO comments (name, content)
    VALUES ($1, $2)
    RETURNING 
      id,
      name,
      content,
      created_at as "createdAt"
  `, [data.name, data.content]);
  
  return result.rows[0];
}

export async function deleteComment(id: number): Promise<boolean> {
  const db = getDB();
  const result = await db.query('DELETE FROM comments WHERE id = $1', [id]);
  
  return result.rowCount > 0;
}