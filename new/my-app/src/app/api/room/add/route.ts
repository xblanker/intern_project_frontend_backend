import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { code: 1, msg: 'Room name is required' },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json({
      code: 0,
      msg: 'Room created successfully',
      data: {
        roomId: room.id,
        roomName: room.name
      }
    });

  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { code: 1, msg: 'Internal server error' },
      { status: 500 }
    );
  }
}
