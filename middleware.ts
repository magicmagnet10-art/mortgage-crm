import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const isLoggedIn =
    req.cookies.get("nsc-auth")?.value === process.env.AUTH_SECRET;

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|api/auth|api/cron|api/push|api/widget|_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icon-|logo\\.png).*)",
  ],
};
