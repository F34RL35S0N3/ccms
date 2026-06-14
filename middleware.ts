import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Middleware to protect routes
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login');
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
  
  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }
  
  // If user is logged in and tries to access login page, redirect to dashboard
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    return NextResponse.next();
  }
  
  // Require authentication for all other routes
  // (Assuming everything is protected except /login)
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }
  
  return NextResponse.next();
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}
