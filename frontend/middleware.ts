import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Le middleware ne peut pas accéder à localStorage
  // La protection se fait côté client dans les pages
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/events'],
};
