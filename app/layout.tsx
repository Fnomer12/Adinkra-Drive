import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ConditionalAIAssistant from "@/components/ConditionalAIAssistant";
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
  title: "Adinkra Drive",
  description: "Premium car rental and purchase platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ConditionalAIAssistant />
      </body>
    </html>
  );
}