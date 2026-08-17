// middleware.ts (Di root folder project Anda)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  // 1. Cek session user menggunakan Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;

  // 2. Definisikan route yang dilindungi
  const isLoginPage = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isLoginPage;

  // 3. Logika Proteksi Route Admin
  // Jika user mencoba akses /admin tapi BELUM login -> Redirect ke /admin/login
  if (isAdminRoute && !session) {
    const loginUrl = new URL("/admin/login", request.url);
    // Simpan URL asal agar setelah login bisa redirect balik ke /admin
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Jika sudah login tapi role-nya bukan ADMIN -> tolak akses /admin
  if (isAdminRoute && session && session.user.role !== "ADMIN") {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("error", "forbidden");
    return NextResponse.redirect(loginUrl);
  }

  // 5. Logika Redirect jika sudah login
  // Jika user SUDAH login tapi mencoba akses /admin/login -> Redirect ke /admin
  // Kecuali ada parameter error (misal: non-admin ditolak → ?error=forbidden).
  if (isLoginPage && session && !request.nextUrl.searchParams.get("error")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // 5. Lanjutkan request jika semua aman
  return NextResponse.next();
}

// Konfigurasi: Hanya jalankan middleware untuk path ini (hemat resource)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
  ],
};
