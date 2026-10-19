// Next.js Proxy Layer (FST Unit 5: Session verification using Next.js Proxy layer proxy.ts)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('findora_session')?.value;

  // Protected routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isPostRoute = pathname.startsWith('/post');
  const isProfileRoute = pathname.startsWith('/profile');

  if (isAdminRoute || isPostRoute || isProfileRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const user = JSON.parse(decodedJson);

        // RBAC check: Only ADMIN can access /admin
        if (isAdminRoute && user.role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/browse?error=unauthorized', request.url));
        }
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/post/:path*', '/profile/:path*'],
};
