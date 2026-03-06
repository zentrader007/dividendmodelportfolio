import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "HDO Model Portfolio",
  description: "High Dividend Opportunities Model Portfolio Tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        <main className="max-w-[1600px] mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
