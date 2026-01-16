import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://new-portfolio-nine-indol.vercel.app"),
  title: "Md Moshin Khan | Full Stack Engineer",
  description: "Portfolio of Md Moshin Khan, a Full Stack Engineer and Creative Developer building high-performance digital architecture.",
  openGraph: {
    title: "Md Moshin Khan | Full Stack Engineer",
    description: "Portfolio of Md Moshin Khan - Creative Developer & Engineer.",
    url: "/",
    siteName: "Md Moshin Khan Portfolio",
    images: [
      {
        url: "/og-image.png", // Add an image file named 'og-image.png' to your public folder
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}