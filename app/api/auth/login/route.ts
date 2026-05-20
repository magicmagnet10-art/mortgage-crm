import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (
    username === process.env.AUTH_USERNAME &&
    password === process.env.AUTH_PASSWORD
  ) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("nsc-auth", process.env.AUTH_SECRET!, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 יום
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ error: "שם משתמש או סיסמא שגויים" }, { status: 401 });
}
