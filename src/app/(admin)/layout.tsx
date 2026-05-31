import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "PickASlot Admin - Villa del Rio Court Booking System",
    description: "Court Booking Management System for Villa del Rio.",
    robots: {
        index: false,
        follow: false,
    },
    openGraph: {
        title: "PickASlot Admin - Villa del Rio Court Booking System",
        description: "Court Booking Management System for Villa del Rio.",
        type: "website",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "PickASlot Admin",
            },
        ],
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}