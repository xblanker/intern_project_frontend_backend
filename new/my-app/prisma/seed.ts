import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始添加种子数据...');

  const users = [
    { userName: 'admin', password: 'admin123' },
    { userName: 'user1', password: 'password123' },
    { userName: 'test', password: 'test123' }
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    await prisma.user.upsert({
      where: { userName: userData.userName },
      update: {},
      create: {
        userName: userData.userName,
        password: hashedPassword,
      },
    });
  }

  const rooms = [
    { name: '通用聊天室' },
    { name: '技术讨论' },
    { name: '随便聊聊' }
  ];

  for (const roomData of rooms) {
    await prisma.room.upsert({
      where: { id: rooms.indexOf(roomData) + 1 },
      update: {},
      create: {
        name: roomData.name,
      },
    });
  }

  console.log('种子数据添加完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
