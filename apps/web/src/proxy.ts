import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'access_token';
const AUTH_PAGES = ['/login', '/cadastro'];
const HOME = '/veiculos';

const isDev = process.env.NODE_ENV !== 'production';

export const buildCsp = (nonce: string, dev = isDev): string => {
  const scriptSrc = dev
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;
  const styleSrc = dev ? `'self' 'unsafe-inline'` : `'self' 'nonce-${nonce}'`;

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ');
};

const redirectTo = (request: NextRequest, pathname: string, search?: Record<string, string>): NextResponse => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search ? `?${new URLSearchParams(search)}` : '';
  return NextResponse.redirect(url);
};

export const proxy = (request: NextRequest): NextResponse => {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!hasSession && !isAuthPage) {
    return redirectTo(request, '/login', pathname === '/' || pathname === HOME ? undefined : { next: `${pathname}${search}` });
  }

  if (hasSession && isAuthPage) {
    return redirectTo(request, HOME);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
};

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|images).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
