import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, getInvalidLocaleRedirect, getLocaleFromPath, isValidLocale, NEXT_LOCALE_COOKIE, resolveRedirectLocale } from "./lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    PUBLIC_FILE.test(pathname) ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Admin routes live at /admin, not /[lang]/admin - keep them out of the locale redirect.
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdminPath) {
    return handleAdminAuth(request, NextResponse.next());
  }

  // Check if pathname already has a valid locale
  const pathnameLocale = getLocaleFromPath(pathname);

  if (pathnameLocale && isValidLocale(pathnameLocale)) {
    // Locale is valid, continue with admin auth check.
    // The header must ride on the REQUEST, not just the response: the root
    // layout sits outside the [lang] segment and can never see route params, so
    // this request header is the only channel that can tell <html lang> which
    // language is actually being served.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-current-locale", pathnameLocale);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("x-current-locale", pathnameLocale);
    return handleAdminAuth(request, response);
  }

  // Segmen locale-ish yang invalid (/fr/about) distrip, bukan ditumpuk
  // menjadi /en/fr/about — target locale ikut cookie > Accept-Language > default.
  const cookieLocale = request.cookies.get(NEXT_LOCALE_COOKIE)?.value ?? null;
  const acceptLanguage = request.headers.get("accept-language");
  const invalidRedirect = getInvalidLocaleRedirect(pathname, { cookieLocale, acceptLanguage });
  if (invalidRedirect) {
    const url = request.nextUrl.clone();
    url.pathname = invalidRedirect;
    const response = NextResponse.redirect(url);
    response.headers.set("x-current-locale", invalidRedirect.split("/").filter(Boolean)[0] ?? DEFAULT_LOCALE);
    return response;
  }

  // No locale in path, redirect to default locale
  // Urutan: cookie NEXT_LOCALE > Accept-Language > DEFAULT_LOCALE.
  const detectedLocale = resolveRedirectLocale({ cookieLocale, acceptLanguage });

  // Redirect to the detected/default locale
  const url = request.nextUrl.clone();
  url.pathname = `/${detectedLocale}${pathname}`;

  const response = NextResponse.redirect(url);
  response.headers.set("x-current-locale", detectedLocale);
  return response;
}

async function handleAdminAuth(request: NextRequest, response: NextResponse) {
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isAdminRoute) {
    return response;
  }

  // Check session user using Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // If user tries to access /admin but NOT logged in -> Redirect to /admin/login
  if (isAdminRoute && !isLoginPage && !session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in but role is not ADMIN -> deny access to /admin
  if (
    isAdminRoute &&
    !isLoginPage &&
    session &&
    session.user.role !== "ADMIN"
  ) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("error", "forbidden");
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in but tries to access /admin/login -> Redirect to /admin
  // Unless there's an error parameter (e.g., non-admin denied -> ?error=forbidden)
  if (isLoginPage && session && !request.nextUrl.searchParams.get("error")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (robots.txt, sitemap.xml, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
