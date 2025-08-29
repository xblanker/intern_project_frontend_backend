import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { roomId, userName, content } = await request.json();

    if (!roomId || !userName || !content) {
      return NextResponse.json(
        { code: 1, msg: 'Room ID, username, and content are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        userName: userName
      }
    });

    if (!user) {
      return NextResponse.json(
        { code: 1, msg: 'User not found' },
        { status: 404 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: user.id,
        roomId: parseInt(roomId)
      },
      include: {
        sender: {
          select: {
            userName: true
          }
        }
      }
    });

    await prisma.room.update({
      where: {
        id: parseInt(roomId)
      },
      data: {
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      code: 0,
      msg: 'Message sent successfully',
      data: {
        id: message.id,
        content: message.content,
        sender: message.sender.userName,
        time: message.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { code: 1, msg: 'Internal server error' },
      { status: 500 }
    );
  }
}
