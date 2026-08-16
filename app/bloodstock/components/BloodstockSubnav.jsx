"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLineageLanguage } from "../../components/use-lineage-language";

const TEXT = {
  es: {
    consultas: "Consultas",
    estadisticas: "Estadísticas",
  },
  pt: {
    consultas: "Consultas",
    estadisticas: "Estatísticas",
  },
  en: {
    consultas: "Queries",
    estadisticas: "Statistics",
  },
};

export default function BloodstockSubnav() {
  const pathname = usePathname();
  const { language } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;

  const isConsultas =
    pathname === "/bloodstock" ||
    pathname === "/bloodstock/consultas" ||
    pathname.startsWith("/bloodstock/consultas/");

  const isEstadisticas =
    pathname === "/bloodstock/estadisticas" ||
    pathname.startsWith("/bloodstock/estadisticas/");

  const activeClass =
    "border border-[#8b0d0d] bg-[#8b0d0d] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white";

  const inactiveClass =
    "border border-[#8b0d0d] bg-[#fbf6ec] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] transition hover:bg-[#8b0d0d] hover:text-white";

  return (
    <nav className="mx-auto max-w-7xl px-5 pt-8">
      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href="/bloodstock/consultas"
          className={isConsultas ? activeClass : inactiveClass}
        >
          {t.consultas}
        </Link>

        <Link
          href="/bloodstock/estadisticas"
          className={isEstadisticas ? activeClass : inactiveClass}
        >
          {t.estadisticas}
        </Link>
      </div>

      <div className="mx-auto mt-6 h-[2px] max-w-7xl bg-[#8b0d0d]" />
    </nav>
  );
}