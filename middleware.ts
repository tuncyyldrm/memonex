import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // --- 1. SONSZ DÖNGÜYÜ ENGELLEYEN PARAMETRE TEMİZLEME ---
  if (searchParams.has('m') && searchParams.get('m') === '1') {
    const url = new URL(request.url); // Tam URL objesi oluştur
    url.searchParams.delete('m');    // Sadece 'm' parametresini sil
    
    // Önemli: Eğer yeni URL eskisiyle aynıysa (döngü oluşmasın) devam et
    if (url.toString() !== request.url) {
      return NextResponse.redirect(url, 301);
    }
  }

  // --- 2. SUPABASE AUTH VE RESPONSE HAZIRLIĞI ---
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // --- 3. ADMIN PANEL KORUMA MANTIĞI ---
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

export const config = {
  // Statik dosyaları dışarıda tutan güvenli matcher
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};