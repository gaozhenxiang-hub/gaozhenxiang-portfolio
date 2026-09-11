import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "高振翔 | AIGC Creator",
  description: "高振翔的 AIGC 影像作品集。",
  icons: {
    icon: "/hero/aigc-cover-fallback.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
