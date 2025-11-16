import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes: admin & checkout
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token and check role for admin routes
    if (pathname.startsWith('/admin')) {
      try {
        const secret = new TextEncoder().encode(
          process.env.NEXT_PUBLIC_JWT_SECRET
        );
        
        const { payload } = await jwtVerify(token, secret);
        
        // Check if user role is not admin
        if (payload.role !== 'admin') {
          const unauthorizedUrl = new URL('/unauthorized', request.url);
          return NextResponse.redirect(unauthorizedUrl);
        }
      } catch (error) {
        // Invalid token, redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/checkout/:path*',
  ]
};