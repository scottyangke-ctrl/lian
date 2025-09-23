import type { Metadata } from "next";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Navigation } from '@/components/Navigation';
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto Trading Platform",
  description: "Advanced cryptocurrency trading strategies platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
          <Navigation />
          <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
