import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Culinary Companion",
  description:
    "Browse, search, and manage recipes. Save favorites, generate shopping lists, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
