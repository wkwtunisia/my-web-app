import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ['/', '/admin/login', '/unauthorized'];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(p => path === p);
  
  // If it's an admin path and not public, check authentication
  if (path.startsWith('/admin') && !isPublicPath) {
    // We'll let the client-side guard handle the actual auth check
    // This middleware just allows the route to be accessed
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
