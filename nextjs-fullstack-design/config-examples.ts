// Prisma Schema 示例 - 现代化数据库 ORM
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // 关系
  messages     Message[]
  roomMembers  RoomMember[]
  createdRooms Room[]       @relation("RoomCreator")

  @@map("users")
}

model Room {
  id          Int       @id @default(autoincrement()) @map("room_id")
  name        String    @map("room_name")
  lastSender  String?   @map("last_sender")
  lastContent String?   @map("last_content")
  lastTime    DateTime? @map("last_time")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // 创建者
  createdById Int? @map("created_by_id")
  createdBy   User? @relation("RoomCreator", fields: [createdById], references: [id])

  // 关系
  messages Message[]
  members  RoomMember[]

  @@map("rooms")
}

model Message {
  id        Int      @id @default(autoincrement()) @map("message_id")
  content   String
  profile   Int      @default(0)
  createdAt DateTime @default(now()) @map("time")

  // 外键
  roomId Int  @map("room_id")
  room   Room @relation(fields: [roomId], references: [id], onDelete: Cascade)

  userId Int  @map("user_id")
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("messages")
}

model RoomMember {
  id       Int      @id @default(autoincrement())
  joinedAt DateTime @default(now()) @map("joined_at")

  // 外键
  roomId Int  @map("room_id")
  room   Room @relation(fields: [roomId], references: [id], onDelete: Cascade)

  userId Int  @map("user_id")
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 复合唯一约束
  @@unique([roomId, userId])
  @@map("room_members")
}

model Comment {
  id        Int      @id @default(autoincrement())
  name      String
  content   String
  createdAt DateTime @default(now()) @map("created_at")

  @@map("comments")
}

// 环境变量示例
// .env.example

# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/chatroom_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Node 环境
NODE_ENV="development"

# 数据库配置（备用）
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="chat_room_user"
DB_PASSWORD="secure_password"
DB_NAME="chat_room_db"

# Next.js 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

// Next.js 配置示例
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pic*.zhimg.com'
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  }
};

module.exports = nextConfig;

// TypeScript 配置
// tsconfig.json

{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

// Tailwind CSS 配置
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
};

// 数据库种子文件示例
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始数据库种子...');

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      username: 'testuser',
      password: hashedPassword,
    },
  });

  console.log('创建测试用户:', testUser);

  // 创建测试房间
  const testRoom = await prisma.room.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '测试聊天室',
      createdById: testUser.id,
    },
  });

  console.log('创建测试房间:', testRoom);

  // 创建测试消息
  const testMessage = await prisma.message.create({
    data: {
      content: '欢迎来到聊天室！',
      roomId: testRoom.id,
      userId: testUser.id,
      profile: 0,
    },
  });

  console.log('创建测试消息:', testMessage);

  // 创建房间成员关系
  await prisma.roomMember.upsert({
    where: {
      roomId_userId: {
        roomId: testRoom.id,
        userId: testUser.id,
      },
    },
    update: {},
    create: {
      roomId: testRoom.id,
      userId: testUser.id,
    },
  });

  console.log('数据库种子完成!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });