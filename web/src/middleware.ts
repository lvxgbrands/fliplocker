import { NextRequest, NextResponse } from "next/server";

// First-line guard: signed-in cookie required for portal routes.
// Role checks and session validity run server-side in each page/layout.
const PROTECTED = ["/seller", "/buyer", "/dashboard", "/hub", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!req.cookies.get("fl_session")?.value) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/seller/:path*", "/buyer/:path*", "/dashboard/:path*"],
};
