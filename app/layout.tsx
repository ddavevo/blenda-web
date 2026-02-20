import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blend-a-Web",
  description: "Convert any website into a physics-based visual blending container.",
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
