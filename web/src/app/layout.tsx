import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlipLocker — verified & documented card deals",
  description:
    "Private, invitation-only verification and logistics for peer-to-peer graded card deals. Payments held securely by our payment processor until verification and delivery are complete.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
