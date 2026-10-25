'use server';

// Server Actions for SVKM Authentication (FST Unit 5: SAP ID + Password)
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signSessionToken, setSessionCookie, clearSessionCookie, UserSession } from '@/lib/auth';

export async function loginAction(formData: FormData) {
  const identifier = ((formData.get('sapId') as string) || (formData.get('email') as string) || '').trim();
  const password = formData.get('password') as string;

  if (!identifier || !password) {
    return { success: false, error: 'SVKM SAP ID or Email and password required' };
  }

  const idLower = identifier.toLowerCase();
  const candidateEmails = [idLower];
  if (idLower === 'admin' || idLower === 'admin-001' || idLower.startsWith('admin')) {
    candidateEmails.push('admin@djsce.edu', 'admin@djsce.edu.in');
  }
  if (idLower === 'suruchi' || idLower === '60017240146' || idLower.includes('suruchi.makwana')) {
    candidateEmails.push('suruchi.makwana46@svkmmumbai.onmicrosoft.com', 'SURUCHI.MAKWANA46@svkmmumbai.onmicrosoft.com');
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
    return { success: false, error: 'Invalid credentials. Only SVKM students/staff allowed.' };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Invalid password' };
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

  return { success: true, user: sessionPayload };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/login');
}
