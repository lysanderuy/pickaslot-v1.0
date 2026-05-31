import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "PickASlot Admin - Villa del Rio Court Booking System",
    description: "Court Booking Management System for Villa del Rio.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}