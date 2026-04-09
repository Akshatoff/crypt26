import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Import your new Client Component
import FullscreenOverlay from "./components/FullScreenOverlay"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crypt@trix 26.0",
  description: "The greatest crypt ever hosted by this school",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* The global invisible fullscreen trigger */}
        <FullscreenOverlay />
        
        {children}
      </body>
    </html>
  );
}