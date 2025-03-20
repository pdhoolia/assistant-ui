import "./global.css";

import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";


export const metadata = {
  title: {
    template: "%s | swe-agent",
    default: "swe-agent",
  },
  description: "Software Engineer Agent",
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode 
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} min-h-screen flex flex-col`} suppressHydrationWarning>
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
