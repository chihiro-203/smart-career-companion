// app/auth/signout/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const requestUrl = new URL(request.url)


  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    // You could redirect to an error page or back to dashboard with an error message
    return NextResponse.redirect(`${requestUrl.origin}/dashboard?error=Failed to sign out`, {
      status: 302, // Or handle as a client-side error display
    });
  }

  // Redirect to the login page after successful sign-out
  return NextResponse.redirect(`${requestUrl.origin}/login?message=You have been signed out.`, {
    status: 302,
  });
}