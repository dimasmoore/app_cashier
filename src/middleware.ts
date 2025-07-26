import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If user is authenticated and trying to access login page, redirect to dashboard
    if (req.nextauth.token && req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/Dashboard", req.url));
    }

    // Allow access to protected routes if authenticated
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page and API routes without authentication
        if (req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/api/")) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
