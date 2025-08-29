import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const { roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json(
        { code: 1, msg: 'Room ID is required' },
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

    await prisma.room.delete({
      where: { id: roomId }
    });

    return NextResponse.json({
      code: 0,
      msg: 'Room deleted successfully'
    });

  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json(
      { code: 1, msg: 'Internal server error' },
      { status: 500 }
    );
  }
}
