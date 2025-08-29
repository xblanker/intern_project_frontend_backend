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

    if (userName.length < 3) {
      return NextResponse.json(
        { code: 1, msg: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { code: 1, msg: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        userName: userName,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { code: 1, msg: 'Username already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        userName: userName,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      code: 0,
      msg: 'Registration successful',
      data: {
        userName: newUser.userName,
        registeredAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { code: 1, msg: 'Internal server error' },
      { status: 500 }
    );
  }
}
