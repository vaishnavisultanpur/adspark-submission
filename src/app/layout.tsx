import type { Metadata } from "next";
import localFont from "next/font/local";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AdSpark — Quick, custom ads in one click",
  description: "AI-generated ad copy for small businesses in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B0E14] text-slate-100`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
