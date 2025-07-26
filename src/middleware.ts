import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    
    if (req.nextauth.token && req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/Dashboard", req.url));
    }

    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        
        if (req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/api/")) {
          return true;
        }

        
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
   
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
