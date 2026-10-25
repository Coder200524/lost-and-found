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

    // Compulsory email suffix check for student email inputs
    const idLower = identifier.toLowerCase();
    if (identifier.includes('@') && !idLower.endsWith('@svkmmumbai.onmicrosoft.com') && !idLower.startsWith('admin')) {
      return NextResponse.json(
        { success: false, error: 'Compulsory SVKM Email Suffix: Email must end with @svkmmumbai.onmicrosoft.com' },
        { status: 400 }
      );
    }

    const candidateEmails = [idLower, idLower.toUpperCase()];
    if (idLower === 'suruchi' || idLower === '60017240146' || idLower.includes('suruchi.makwana')) {
      candidateEmails.push('suruchi.makwana46@svkmmumbai.onmicrosoft.com', 'SURUCHI.MAKWANA46@svkmmumbai.onmicrosoft.com');
    }
    if (idLower === 'admin' || idLower === 'admin-001' || idLower.startsWith('admin')) {
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
