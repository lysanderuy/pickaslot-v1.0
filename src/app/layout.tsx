import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pickaslot.vercel.app"),
  title: "PickASlot - Villa del Rio Court Booking System",
  description: "Book your Tennis or Pickleball slots at Villa del Rio Court.",
  openGraph: {
    title: "PickASlot - Villa del Rio Court Booking System",
    description: "Book your Tennis or Pickleball slots at Villa del Rio Court.",
    siteName: "PickASlot",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PickASlot - Villa del Rio Court Booking System",
    description:
      "Book your Tennis or Pickleball slots at Villa del Rio Court.",
    images: ["/og-image.png"],
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
      className={`${jakartaSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
