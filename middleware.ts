import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight middleware — cek session cookie tanpa import auth library.
 * Menghindari bundle size limit 1 MB pada Vercel Hobby Edge Runtime.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan semua route API, static assets, dan file publik
  const isPublicPath =
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.ico";

  if (isPublicPath) return NextResponse.next();

  const isAuthPage = pathname.startsWith("/login");

  // Cek session cookie NextAuth (nama berbeda di dev vs production)
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  // Sudah login + akses halaman login → redirect ke dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Belum login + akses halaman protected → redirect ke login
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Jalankan middleware di semua halaman kecuali static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
};
