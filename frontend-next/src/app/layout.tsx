import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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
      <body className={jakarta.className}>
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-lp-border">
          <div className="container h-20 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="text-2xl font-black text-lp-accent tracking-tighter">SKILLOVATE</div>
              <div className="hidden md:flex items-center gap-6 text-sm font-bold text-lp-muted">
                <a href="/assessments" className="hover:text-lp-accent transition-colors">Assessments</a>
                <a href="/interviews" className="hover:text-lp-accent transition-colors">Interviews</a>
                <a href="#" className="hover:text-lp-accent transition-colors">Resources</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm font-bold text-lp-muted">Sign In</button>
              <button className="btn-primary">Get Started</button>
            </div>
          </div>
        </nav>
        <main>{children}</body >
    </html>
  );
}
