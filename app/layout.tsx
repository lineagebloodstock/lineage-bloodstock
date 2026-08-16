import type { Metadata } from "next";
import { Libre_Franklin, Oswald } from "next/font/google";
import "./globals.css";
import SiteHeader from "./components/site-header";

const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lineage Bloodstock",
  description: "International racing, bloodstock, pedigrees and news platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${libreFranklin.variable} ${oswald.variable}`}>
        <div className="w-full bg-[#8b0d0d] px-5 py-2 text-center text-[11px] font-normal uppercase leading-5 tracking-[0.22em] text-white">
          From Breeding to Black Type
        </div>

        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
