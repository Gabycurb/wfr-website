import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WFR - Wood Finishes and Renovations",
  description: "Transform your space with expert craftsmanship and attention to detail",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}