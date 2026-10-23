import type { Metadata } from "next";
import { ViewTransition } from "react";
import localFont from "next/font/local";
import { ArriveOnce } from "@/components/arrive-once";
import "./globals.css";

/**
 * One typeface, self-hosted via next/font so there is no third-party
 * request and no layout shift. Inter is the PLACEHOLDER until the
 * specimen page settles the face.
 */
const sans = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-sans-var",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Emily Loggins",
  description: "Product designer who ships.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} h-full antialiased`}>
      <head>
        <ArriveOnce />
      </head>
      <body className="flex min-h-full flex-col">
        <ViewTransition>{children}</ViewTransition>
      </body>
    </html>
  );
}
