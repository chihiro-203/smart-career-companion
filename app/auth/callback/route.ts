/* eslint-disable @typescript-eslint/no-unused-vars */
// app/auth/callback/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Corrected import
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies(); // Get the cookie store
    const supabase = createServerClient( // Use createServerClient
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            return (await cookieStore).get(name)?.value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            try {
              (await cookieStore).set({ name, value, ...options });
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          async remove(name: string, options: CookieOptions) {
            try {
              (await cookieStore).set({ name, value: '', ...options });
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      // Log the error and redirect
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_failed&message=${(error as Error).message}`);
    }
  } else {
    console.warn("Callback received without a code.");
    // Redirect back to an appropriate page if no code is found
    return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_no_code`);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}