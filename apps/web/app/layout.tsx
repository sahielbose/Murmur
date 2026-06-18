import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Murmur",
  description:
    "Murmur is an AI notetaker for real-world conversations. Record or upload, and get clean notes, to-dos, and answers — right in your browser.",
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
