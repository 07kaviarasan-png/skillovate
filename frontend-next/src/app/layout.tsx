import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Skillovate AI — Train Smarter, Score Higher",
  description: "AI-Powered Placement Prep & Career Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jakarta.className} suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-[#FCFDFF]">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
