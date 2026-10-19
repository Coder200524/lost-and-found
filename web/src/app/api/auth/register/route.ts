// Auth Register Route Handler (FST Unit 5)
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signSessionToken, setSessionCookie, UserSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, department, collegeId } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, and password required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'USER',
        department: department || 'Information Technology',
        collegeId: collegeId || 'DJSCE-' + Math.floor(1000 + Math.random() * 9000),
        avatar: '🎓',
      },
    });

    const sessionPayload: UserSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'USER',
      avatar: user.avatar,
      department: user.department,
      collegeId: user.collegeId,
    };

    const token = signSessionToken(sessionPayload);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: sessionPayload,
      token,
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}
