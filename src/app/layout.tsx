import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YardPilot",
  description: "CRM for lawn care businesses",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}