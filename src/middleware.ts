import { NextRequest, NextResponse } from "next/server";

const ADMIN_ORIGIN = process.env.NEXT_PUBLIC_ADMIN_ORIGIN ?? "http://localhost:3001";
const STOREFRONT_ORIGIN = process.env.NEXT_PUBLIC_STOREFRONT_ORIGIN ?? "http://localhost:3000";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const port = request.nextUrl.port;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/products") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Storefront: send /admin and staff login to the admin host
  if (port === "3000") {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(`${ADMIN_ORIGIN}${pathname}${search}`);
    }
    if (pathname === "/staff-login" || pathname.startsWith("/staff-login/")) {
      return NextResponse.redirect(`${ADMIN_ORIGIN}/staff-login${search}`);
    }
  }

  // Admin host: staff login only — never the customer login UI
  if (port === "3001") {
    if (pathname === "/login" || pathname.startsWith("/login/")) {
      return NextResponse.redirect(new URL(`/staff-login${search}`, request.url));
    }
    if (pathname === "/staff-login" || pathname.startsWith("/staff-login/")) {
      return NextResponse.next();
    }
    if (!pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Keep STOREFRONT_ORIGIN referenced for env parity in deploys
  void STOREFRONT_ORIGIN;

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.jpg$).*)"],
};
