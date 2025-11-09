import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const redirectToAuth = (request: NextRequest) => {
  const signInUrl = new URL('/auth', request.url);
  signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
};

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return redirectToAuth(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/resume-builder/:path*'],
};
