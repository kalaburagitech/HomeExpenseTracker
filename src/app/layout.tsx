import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-no-jsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Home Expense Tracker",
  description: "Track and manage home expenses with friends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
