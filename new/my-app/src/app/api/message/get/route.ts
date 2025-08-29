import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { code: 1, msg: 'Room ID is required' },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        roomId: parseInt(roomId)
      },
      include: {
        sender: {
          select: {
            userName: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const formattedMessages = messages.map((message, index) => ({
      profile: index % 6,
      sender: message.sender.userName,
      content: message.content,
      time: message.createdAt.toISOString()
    }));

    return NextResponse.json({
      code: 0,
      data: formattedMessages
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { code: 1, msg: 'Internal server error' },
      { status: 500 }
    );
  }
}
