"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./site-header";

export default function SiteShell({ children }) {
  const pathname = usePathname();

  const isAccessPage =
    pathname === "/acceso-lineage" ||
    pathname.startsWith("/acceso-lineage/") ||
    pathname === "/acceso" ||
    pathname.startsWith("/acceso/");

  if (isAccessPage) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />

      <div className="border-b border-[#8b0d0d] bg-[#8b0d0d] px-5 py-3 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
          From Breeding to Black Type
        </p>
      </div>

      {children}
    </>
  );
}