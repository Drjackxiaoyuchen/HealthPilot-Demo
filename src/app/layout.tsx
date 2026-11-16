import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import SectionContext from "@/components/layout/section-context";

export const metadata: Metadata = {
  title: "Symphony AI — Your health signals, together",
  description:
    "A local personal health workspace for glucose, genomics, blood work and source-linked insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Sidebar />
        <div className="app-shell ml-[250px] min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 px-8 pb-10 pt-4 max-w-[1200px]">
            <SectionContext />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
