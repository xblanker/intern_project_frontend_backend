import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                userName: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const formattedRooms = rooms.map(room => ({
      roomId: room.id,
      roomName: room.name,
      lastSender: room.messages[0]?.sender ? {
        String: room.messages[0].sender.userName,
        Valid: true
      } : { String: '', Valid: false },
      lastContent: room.messages[0]?.content ? {
        String: room.messages[0].content,
        Valid: true
      } : { String: '', Valid: false },
      lastTime: room.messages[0]?.createdAt ? {
        Time: room.messages[0].createdAt.toString(),
        Valid: true
      } : { Time: '', Valid: false }
    }));

    return NextResponse.json({
      code: 0,
      data: formattedRooms
    });

  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { code: 1, msg: 'Internal server error' },
      { status: 500 }
    );
  }
}
