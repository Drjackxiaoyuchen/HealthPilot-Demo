import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Health Compass — Pre-emptive Personal Health",
  description: "A pre-emptive personal health platform — genome, CGM, blood work, diet, and family history in one local-first dashboard",
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
