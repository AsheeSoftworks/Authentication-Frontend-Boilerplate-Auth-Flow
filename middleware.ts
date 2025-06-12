import axios from "axios";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define routes that require the user to be authenticated
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

// Define authentication-related routes that should not be accessed by logged-in users
const authRoutes = ["/login", "/signup", "/verify-email"];

/**
 * Middleware to handle authentication-based route protection and redirection.
 * - Prevents unauthenticated access to protected routes.
 * - Redirects authenticated users away from auth routes.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Attempt to retrieve the auth token from cookies
  const token = request.cookies.get("auth-token");

  /**
   * Handle access to protected routes:
   * - If no token is found, redirect to the signin page and preserve the original destination via `returnUrl`.
   * - If a token is found, verify its validity by calling the backend token verification endpoint.
   *   If verification fails, redirect to the signin page.
   */
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      // Redirect unauthenticated users to signin, preserving intended destination
      const url = new URL("/signin", request.url);
      url.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(url);
    } else {
      try {
        // Verify token validity with the backend
        const verify = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-token`,
          { token: token.value }
        );

        if (!verify.data.valid) {
          throw new Error("Invalid token");
        }
      } catch (err) {
        // Redirect to signin if token is invalid or verification fails
        const url = new URL("/signin", request.url);
        url.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  /**
   * Handle access to auth routes:
   * - If a user is already authenticated, redirect them to the dashboard to avoid redundant login/signup.
   */
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow request to proceed if no redirects are required
  return NextResponse.next();
}

// Apply the middleware only to the specified routes (protected and auth-related)
export const config = {
  matcher: [...protectedRoutes, ...authRoutes],
};
