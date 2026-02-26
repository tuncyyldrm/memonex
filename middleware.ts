import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. DÖNGÜ KIRICI: Eğer 'm=1' varsa, HEMEN yönlendir ve diğer kodları çalıştırma
  if (searchParams.has('m') && searchParams.get('m') === '1') {
    const url = new URL(request.url);
    url.searchParams.delete('m'); // Parametreyi sil
    return NextResponse.redirect(url, 302); // 302 (Geçici) kullan ki tarayıcı ezberlemesin
  }

  // 2. SUPABASE VE AUTH MANTIĞI (Mevcut kodların)
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const isAuthPage = pathname === '/admin/auth';
  const isAdminPage = pathname.startsWith('/admin');

  if (!session && isAdminPage && !isAuthPage) {
    return NextResponse.redirect(new URL('/admin/auth', request.url));
  }
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

// MATCH_ALL: Tüm sayfaları kapsasın ki ?m=1 her yerde yakalansın
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};