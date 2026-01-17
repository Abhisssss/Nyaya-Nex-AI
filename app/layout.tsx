import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Removed Geist font imports
import "./globals.css";

export const metadata: Metadata = {
  title: "Nyaya Nexus AI Payout Portal",
  description: "Payout Verification Application for mobile users.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
