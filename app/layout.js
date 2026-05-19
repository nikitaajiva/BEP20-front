// Polyfill localStorage for server-side rendering
if (typeof window === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  };
}

import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ReferralProvider } from "../context/ReferralContext";
import GA_TagManager from "./GAOnRoutes"; // <-- add this import
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import AppLayout from "@/components/AppLayout";
import StyledJsxRegistry from "@/lib/registry";

export const metadata = {
  title: "Toking Hoofborn | Elite Racing Ecosystem",
  description: "Experience the next generation of digital horse racing and liquidity management with Toking Hoofborn. The premium ecosystem for BEP20 rewards, staking, and elite circuit access.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Dela+Gothic+One&family=Lilita+One&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&family=Montserrat:wght@700;800;900&family=Archivo+Black&family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Edu+AU+VIC+WA+NT+Arrows:wght@400..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Sans+Math&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=REM:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&family=Saira+Stencil+One&family=Poppins:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        <script
          src="https://static.elfsight.com/platform/platform.js"
          async
        ></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Suspense fallback={null}>
          <GA_TagManager />
        </Suspense>
        <AuthProvider>
          <ReferralProvider>
            <StyledJsxRegistry>
              <AppLayout>{children}</AppLayout>
            </StyledJsxRegistry>
          </ReferralProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
