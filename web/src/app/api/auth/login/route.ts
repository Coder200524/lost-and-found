// SVKM Auth Login Route Handler (SAP ID + Password or College Email)
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signSessionToken, setSessionCookie, UserSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, sapId, password } = await request.json();
    const identifier = (sapId || email || '').trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'SVKM SAP ID / College Email and password required' },
        { status: 400 }
      );
    }

    // Look up by either SAP ID or College Email (with alias normalization for @djsce.edu and @djsce.edu.in)
    const idLower = identifier.toLowerCase();
    const candidateEmails = [idLower];
    if (idLower.endsWith('@djsce.edu.in')) {
      candidateEmails.push(idLower.replace('@djsce.edu.in', '@djsce.edu'));
    } else if (idLower.endsWith('@djsce.edu')) {
      candidateEmails.push(idLower.replace('@djsce.edu', '@djsce.edu.in'));
    }
    if (idLower === 'admin' || idLower === 'admin-001') {
      candidateEmails.push('admin@djsce.edu', 'admin@djsce.edu.in');
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { in: candidateEmails } },
          { sapId: { in: [identifier, identifier.toUpperCase(), idLower] } },
          { collegeId: { in: [identifier, identifier.toUpperCase()] } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid SVKM credentials. Only registered SVKM members permitted.' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid SVKM credentials' },
        { status: 401 }
      );
    }

    const sessionPayload: UserSession = {
      id: user.id,
      sapId: user.sapId,
      name: user.name,
      email: user.email,
      role: user.role as 'ADMIN' | 'USER' | 'GUEST',
      avatar: user.avatar,
      phone: user.phone,
      department: user.department,
      collegeId: user.collegeId,
      points: user.points,
      badge: user.badge,
    };

    const token = signSessionToken(sessionPayload);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: 'SVKM Authentication successful',
      user: sessionPayload,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
