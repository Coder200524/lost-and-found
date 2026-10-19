// Next.js Proxy Layer (FST Unit 5: Session verification using Next.js Proxy layer proxy.ts)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('findora_session')?.value;

  // Protected routes: browse, post, swipe, chat, items, profile, admin
  const isProtectedRoute =
    pathname === '/browse' || pathname.startsWith('/browse/') ||
    pathname === '/post' || pathname.startsWith('/post/') ||
    pathname === '/swipe' || pathname.startsWith('/swipe/') ||
    pathname === '/chat' || pathname.startsWith('/chat/') ||
    pathname.startsWith('/items/') ||
    pathname === '/profile' || pathname.startsWith('/profile/') ||
    pathname === '/admin' || pathname.startsWith('/admin/');

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isProtectedRoute) {
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
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/browse',
    '/browse/:path*',
    '/post',
    '/post/:path*',
    '/swipe',
    '/swipe/:path*',
    '/chat',
    '/chat/:path*',
    '/items/:path*',
    '/profile',
    '/profile/:path*',
    '/admin',
    '/admin/:path*',
  ],
};
