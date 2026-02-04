import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // On récupère le cookie 'token'
  const token = request.cookies.get('token')?.value;

  // Si l'utilisateur est sur le dashboard ET qu'il n'a pas de token
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    // On le redirige vers le login
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Sinon, on laisse passer
  return NextResponse.next();
}

// Configuration : Ce middleware ne s'applique que sur les routes commençant par /dashboard
export const config = {
  matcher: ['/dashboard/:path*'],
};