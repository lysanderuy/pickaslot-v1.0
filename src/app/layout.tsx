import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
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
  title: "PickASlot – Book Your Pickleball Slot",
  description:
    "Reserve your court time at Villa Del Rio Pickleball Court. Quick booking, real-time availability, no hassle.",
  openGraph: {
    title: "PickASlot – Book Your Pickleball Slot",
    description:
      "Reserve your court time at Villa Del Rio Pickleball Court. Quick booking, real-time availability, no hassle.",
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
    title: "PickASlot – Book Your Pickleball Slot",
    description:
      "Reserve your court time at Villa Del Rio Pickleball Court. Quick booking, real-time availability, no hassle.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
