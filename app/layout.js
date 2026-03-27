import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
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

export const metadata = {
  title: "BEPVault | Premium BEP20 Liquidity Dashboard",
  description: "Join BEPVault - The most advanced BEP20 liquidity and rewards dashboard. Stake, earn, and build your community with ease.",
  icons: {
    icon: "/bepvault_logo.png",
    shortcut: "/bepvault_logo.png",
    apple: "/bepvault_logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        ></link>
        <script
          src="https://static.elfsight.com/platform/platform.js"
          async
        ></script>
        <link
          href="https://fonts.googleapis.com/css2?family=Saira+Stencil+One&family=Poppins:wght@400;700;800&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Suspense fallback={null}>
          <GA_TagManager />
        </Suspense>
        <AuthProvider>
          <ReferralProvider>
            <AppLayout>{children}</AppLayout>
          </ReferralProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
