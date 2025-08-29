import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { userName, password } = await request.json();

    if (!userName || !password) {
      return NextResponse.json(
        { code: 1, msg: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        userName: userName,
      },
    });

    if (!user) {
      return NextResponse.json(
        { code: 1, msg: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { code: 1, msg: 'Invalid username or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      code: 0,
      msg: 'Login successful',
      data: {
        userName: user.userName,
        token: `token_${Date.now()}`
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { code: 1, msg: 'Internal server error' },
      { status: 500 }
    );
  }
}
