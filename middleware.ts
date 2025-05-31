import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: new Headers(req.headers),
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
          req.cookies.set({ name, value, ...options });
          res = NextResponse.next({ request: { headers: new Headers(req.headers) } });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          res = NextResponse.next({ request: { headers: new Headers(req.headers) } });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error in middleware getSession:', error.message);
  }

  const { pathname } = req.nextUrl;

  // --- START OF MODIFICATIONS FOR ROOT REDIRECT ---

  // 1. If user is NOT signed in AND is on the root path ('/')
  if (!session && pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    console.log("MIDDLEWARE: No session, redirecting from root to login");
    return NextResponse.redirect(url);
  }

  // --- END OF MODIFICATIONS FOR ROOT REDIRECT ---


  // 2. If user is NOT signed in AND is trying to access a protected route (e.g., /dashboard)
  //    (Ensure this doesn't conflict with the root redirect if your root IS your dashboard conceptually)
  if (!session && pathname.startsWith('/dashboard')) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    console.log("MIDDLEWARE: No session, redirecting from dashboard to login");
    return NextResponse.redirect(url);
  }

  // 3. If user IS signed in AND is trying to access auth pages (login/signup)
  if (session && (pathname === '/login' || pathname === '/signup')) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    console.log("MIDDLEWARE: Session exists, redirecting from auth page to dashboard");
    return NextResponse.redirect(url);
  }

  // 4. If user IS signed in AND is on the root path ('/'), redirect to dashboard
  //    (This prevents authenticated users from seeing a generic root page if one exists)
  if (session && pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    console.log("MIDDLEWARE: Session exists, redirecting from root to dashboard");
    return NextResponse.redirect(url);
  }


  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};