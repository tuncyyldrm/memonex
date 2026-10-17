import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. DÖNGÜ KIRICI: Eğer 'm=1' varsa, HEMEN yönlendir ve diğer kodları çalıştırma
  if (searchParams.has('m') && searchParams.get('m') === '1') {
    const url = new URL(request.url);
    url.searchParams.delete('m'); // Parametreyi sil
    return NextResponse.redirect(url, 302); // 302 (Geçici) kullan ki tarayıcı ezberlemesin
  }

  const isAuthPage = pathname === '/admin/auth';
  const isAdminPage = pathname.startsWith('/admin');

  // Ziyaretçi sayfalarında (/, /products, /blog vb.) Supabase Auth sorgusu yapma (Kota koruma)
  if (!isAdminPage) {
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }

  // 2. SUPABASE VE AUTH MANTIĞI (Yalnızca /admin rotaları için)
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isAuthPage) {
    const redirectUrl = new URL('/admin/auth', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  if (user && isAuthPage) {
    const redirectUrl = new URL('/admin', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// MATCH_ALL: Tüm sayfaları kapsasın ki ?m=1 her yerde yakalansın
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
