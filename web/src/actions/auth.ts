'use server';

// Server Actions for Authentication (FST Unit 5)
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signSessionToken, setSessionCookie, clearSessionCookie, UserSession } from '@/lib/auth';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password required' };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Invalid credentials' };
  }

  const sessionPayload: UserSession = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as 'ADMIN' | 'USER' | 'GUEST',
    avatar: user.avatar,
    department: user.department,
    collegeId: user.collegeId,
  };

  const token = signSessionToken(sessionPayload);
  await setSessionCookie(token);

  return { success: true, user: sessionPayload };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/login');
}
