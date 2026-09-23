import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, getLocaleFromPath, isValidLocale } from "./lib/i18n";

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

  // Check if pathname already has a valid locale
  const pathnameLocale = getLocaleFromPath(pathname);

  if (pathnameLocale && isValidLocale(pathnameLocale)) {
    // Locale is valid, continue with admin auth check
    const response = NextResponse.next();
    response.headers.set("x-current-locale", pathnameLocale);
    return handleAdminAuth(request, response);
  }

  // No locale in path, redirect to default locale
  // But first check Accept-Language header for better UX
  const acceptLanguage = request.headers.get("accept-language");
  let detectedLocale = DEFAULT_LOCALE;

  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(",")[0]
      .split("-")[0]
      .toLowerCase();
    if (isValidLocale(preferredLocale)) {
      detectedLocale = preferredLocale;
    }
  }

  // Redirect to the detected/default locale
  const url = request.nextUrl.clone();
  url.pathname = `/${detectedLocale}${pathname}`;

  const response = NextResponse.redirect(url);
  response.headers.set("x-current-locale", detectedLocale);
  return response;
}

async function handleAdminAuth(request: NextRequest, response: NextResponse) {
  const pathname = request.nextUrl.pathname;

  // Only check auth for admin routes
  const isLoginPage =
    pathname === `/${request.headers.get("x-current-locale")}/admin/login` ||
    pathname === "/admin/login";
  const isAdminRoute =
    pathname.startsWith(`/${request.headers.get("x-current-locale")}/admin`) ||
    pathname.startsWith("/admin");

  if (!isAdminRoute) {
    return response;
  }

  // Check session user using Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // If user tries to access /admin but NOT logged in -> Redirect to /admin/login
  if (isAdminRoute && !isLoginPage && !session) {
    const loginUrl = new URL(
      `/${request.headers.get("x-current-locale")}/admin/login`,
      request.url,
    );
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
    const loginUrl = new URL(
      `/${request.headers.get("x-current-locale")}/admin/login`,
      request.url,
    );
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("error", "forbidden");
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in but tries to access /admin/login -> Redirect to /admin
  // Unless there's an error parameter (e.g., non-admin denied -> ?error=forbidden)
  if (isLoginPage && session && !request.nextUrl.searchParams.get("error")) {
    return NextResponse.redirect(
      new URL(`/${request.headers.get("x-current-locale")}/admin`, request.url),
    );
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
