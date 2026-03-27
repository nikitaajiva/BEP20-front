import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;

  // Remove the redirect to allow the exact root path to render the new landing page
  // if (url.pathname === "/") {
  //   return NextResponse.redirect("https://bepvault.io");
  // }

  // Allow all other routes
  return NextResponse.next();
}
