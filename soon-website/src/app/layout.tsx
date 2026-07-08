import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import ScrollController from "@/components/three/scroll-controller";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  // Resolves the opengraph-image.png (auto-wired by the file convention) to an
  // absolute URL, which link-preview crawlers require.
  metadataBase: new URL("https://www.soonhackathon.ca"),
  title: "SOON",
  description: "We'd love to hear from you.",
  openGraph: {
    title: "SOON",
    description: "We'd love to hear from you.",
    url: "/",
    siteName: "SOON",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOON",
    description: "We'd love to hear from you.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ScrollController />
        {children}
      </body>
    </html>
  );
}
