import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Monoline | Student Registration",
  description: "Monoline student enrollment and administration",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
