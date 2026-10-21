import { NextResponse, type NextRequest } from "next/server";

/**
 * Kiểm tra lạc quan cho Ops Portal: không có cookie phiên → về /login ngay,
 * không render gì. Kiểm tra thật (session còn hạn, quyền) nằm ở app/ops/layout.tsx.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("oi_session")) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/ops", "/ops/:path*"],
};
