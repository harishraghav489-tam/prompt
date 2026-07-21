import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/challenge") {
    const response = NextResponse.next();
    response.cookies.set("challenge_bypass", "1", {
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/challenge"],
};
