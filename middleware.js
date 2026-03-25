import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;

  // Redirect ONLY the root path
  if (url.pathname === "/") {
    return NextResponse.redirect("https://bepvault.io");
  }

  // Allow all other routes
  return NextResponse.next();
}
