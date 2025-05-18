// middleware.ts (or src/middleware.ts)
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Use createServerClient
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // We need to create a response object that we can modify (e.g. to set cookies)
  // and return it from the middleware.
  let res = NextResponse.next({
    request: {
      headers: new Headers(req.headers), // Pass along request headers
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set, update the request cookies object.
          // This is useful for Server Components.
          req.cookies.set({
            name,
            value,
            ...options,
          });
          // Also update the response cookies.
          res = NextResponse.next({
            request: {
              headers: new Headers(req.headers),
            },
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request cookies object.
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          // Also update the response cookies.
          res = NextResponse.next({
            request: {
              headers: new Headers(req.headers),
            },
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired - important!
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error in middleware getSession:', error.message);
  }

  const { pathname } = req.nextUrl;

  // 1. If user is NOT signed in AND is trying to access a protected route
  if (!session && pathname.startsWith('/')) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. If user IS signed in AND is trying to access auth pages
  if (session && (pathname === '/login' || pathname === '/signup')) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return res; // Return the (potentially modified) response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};