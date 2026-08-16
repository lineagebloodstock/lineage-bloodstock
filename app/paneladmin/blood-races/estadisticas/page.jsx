"use client";

import Link from "next/link";
import { useLineageLanguage } from "../../../components/use-lineage-language";

const TEXT = {
  es: {
    title: "Estadísticas",
    subtitle:
      "Resumen general de registros importados y estado de la base Bloodstock-Carreras.",
    back: "Volver",
    horses: "Caballos",
    jockeys: "Jockeys",
    trainers: "Entrenadores",
    owners: "Owners",
    racetracks: "Hipódromos",
    races: "Carreras",
    imported: "Importados",
    review: "Para revisar",
    sources: "Fuentes activas",
    empty: "Las estadísticas se van a completar cuando conectemos Supabase.",
  },
  pt: {
    title: "Estatísticas",
    subtitle:
      "Resumo geral de registros importados e estado da base Bloodstock-Corridas.",
    back: "Voltar",
    horses: "Cavalos",
    jockeys: "Jóqueis",
    trainers: "Treinadores",
    owners: "Owners",
    racetracks: "Hipódromos",
    races: "Corridas",
    imported: "Importados",
    review: "Para revisar",
    sources: "Fontes ativas",
    empty: "As estatísticas serão completadas quando conectarmos o Supabase.",
  },
  en: {
    title: "Statistics",
    subtitle:
      "General overview of imported records and Bloodstock-Races database status.",
    back: "Back",
    horses: "Horses",
    jockeys: "Jockeys",
    trainers: "Trainers",
    owners: "Owners",
    racetracks: "Racetracks",
    races: "Races",
    imported: "Imported",
    review: "To review",
    sources: "Active sources",
    empty: "Statistics will be completed once we connect Supabase.",
  },
};

export default function EstadisticasBloodRacesPage() {
  const { language } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;

  const cards = [
    { label: t.horses, value: 0 },
    { label: t.jockeys, value: 0 },
    { label: t.trainers, value: 0 },
    { label: t.owners, value: 0 },
    { label: t.racetracks, value: 0 },
    { label: t.races, value: 0 },
    { label: t.imported, value: 0 },
    { label: t.review, value: 0 },
    { label: t.sources, value: 0 },
  ];

  return (
    <main className="min-h-screen bg-[#f8f1e5] px-5 py-10 text-[#2b140f]">
      <section className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b0d0d]">
              Bloodstock-Carreras
            </p>

            <h1 className="text-4xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
              {t.title}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#6f5b50]">
              {t.subtitle}
            </p>
          </div>

          <Link
            href="/paneladmin/blood-races"
            className="border border-[#8b0d0d] bg-[#fbf6ec] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] transition hover:bg-[#8b0d0d] hover:text-white"
          >
            {t.back}
          </Link>
        </div>

        <div className="h-[2px] w-full bg-[#8b0d0d]" />

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="border border-[#e5d3bd] bg-[#fffaf1] p-6"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
                {card.label}
              </p>

              <p className="mt-4 text-4xl font-semibold text-[#2b140f]">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 border border-[#8b0d0d] bg-[#fffaf1] p-5 text-sm font-semibold text-[#8b0d0d]">
          {t.empty}
        </p>
      </section>
    </main>
  );
}