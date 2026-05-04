import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export const metadata: Metadata = {
  title: "HealthPilot — Precision Health",
  description: "Science-driven personal health management platform with genomic integration",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Sidebar />
        <div className="ml-[250px] min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 px-8 pb-10 pt-4 max-w-[1200px]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
