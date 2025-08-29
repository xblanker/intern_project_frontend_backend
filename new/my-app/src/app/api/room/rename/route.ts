import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const { roomId, newName } = await request.json();

    if (!roomId || !newName) {
      return NextResponse.json(
        { code: 1, msg: 'Room ID and new name are required' },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return NextResponse.json(
        { code: 1, msg: 'Room not found' },
        { status: 404 }
      );
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { name: newName }
    });

    return NextResponse.json({
      code: 0,
      msg: 'Room renamed successfully',
      data: {
        roomId: updatedRoom.id,
        roomName: updatedRoom.name
      }
    });

  } catch (error) {
    console.error('Rename room error:', error);
    return NextResponse.json(
      { code: 1, msg: 'Internal server error' },
      { status: 500 }
    );
  }
}
