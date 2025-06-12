import axios from "axios";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes
const protectedRoutes = ["/dashboard", "/profile", "/settings"];
// Define auth routes (routes that should redirect to dashboard if already logged in)
const authRoutes = ["/login", "/signup", "/verify-email"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookies
  const token = request.cookies.get("auth-token");

  // Check if trying to access a protected route without authentication
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      // Redirect to signin page with a return URL
      const url = new URL("/signin", request.url);
      url.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(url);
    } else {
      try {
        const verify = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-token`,
          { token: token.value }
        );

        if (!verify.data.valid) {
          throw new Error("Invalid token");
        }
      } catch (err) {
        const url = new URL("/signin", request.url);
        url.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  // Check if trying to access auth routes while already authenticated
  if (authRoutes.includes(pathname) && token) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [...protectedRoutes, ...authRoutes],
};
