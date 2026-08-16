"use client";

import Link from "next/link";
import { useLineageLanguage } from "../../components/use-lineage-language";

const TEXT = {
  es: {
    eyebrow: "Lineage",
    title: "Bloodstock-Carreras - Admin",
    subtitle:
      "Administración interna de la base de datos deportiva y bloodstock de Lineage.",
    back: "Volver al panel admin",
    horses: "Caballos",
    jockeys: "Jockeys",
    trainers: "Entrenadores",
    owners: "Owners",
    racetracks: "Hipódromos",
    races: "Carreras",
    stats: "Estadísticas",
  },
  pt: {
    eyebrow: "Lineage",
    title: "Bloodstock-Corridas - Admin",
    subtitle:
      "Administração interna da base de dados esportiva e bloodstock da Lineage.",
    back: "Voltar ao painel admin",
    horses: "Cavalos",
    jockeys: "Jóqueis",
    trainers: "Treinadores",
    owners: "Owners",
    racetracks: "Hipódromos",
    races: "Corridas",
    stats: "Estatísticas",
  },
  en: {
    eyebrow: "Lineage",
    title: "Bloodstock-Races - Admin",
    subtitle:
      "Internal management for Lineage sport and bloodstock database.",
    back: "Back to admin panel",
    horses: "Horses",
    jockeys: "Jockeys",
    trainers: "Trainers",
    owners: "Owners",
    racetracks: "Racetracks",
    races: "Races",
    stats: "Statistics",
  },
};

export default function BloodRacesAdminPage() {
  const { language } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;

  const buttons = [
    {
      title: t.horses,
      href: "/paneladmin/blood-races/caballos",
    },
    {
      title: t.jockeys,
      href: "/paneladmin/blood-races/jockeys",
    },
    {
      title: t.trainers,
      href: "/paneladmin/blood-races/trainers",
    },
    {
      title: t.owners,
      href: "/paneladmin/blood-races/owners",
    },
    {
      title: t.racetracks,
      href: "/paneladmin/blood-races/hipodromo",
    },
    {
      title: t.races,
      href: "/paneladmin/blood-races/carreras",
    },
    {
      title: t.stats,
      href: "/paneladmin/blood-races/estadisticas",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f1e5] px-5 py-12 text-[#2b140f]">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8b0d0d]">
              {t.eyebrow}
            </p>

            <h1 className="text-4xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d] md:text-5xl">
              {t.title}
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-[#6f5b50] md:text-base">
              {t.subtitle}
            </p>
          </div>

          <Link
            href="/paneladmin"
            className="border border-[#8b0d0d] bg-[#fbf6ec] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] transition hover:bg-[#8b0d0d] hover:text-white"
          >
            {t.back}
          </Link>
        </div>

        <div className="h-[2px] w-full bg-[#8b0d0d]" />

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {buttons.map((button) => (
            <Link
              key={button.href}
              href={button.href}
              className="border border-[#8b0d0d] bg-[#fbf6ec] px-6 py-5 text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#8b0d0d] transition hover:bg-[#8b0d0d] hover:text-white"
            >
              {button.title}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}