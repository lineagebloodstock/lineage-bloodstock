"use client";

import Link from "next/link";
import { useLineageLanguage } from "../components/use-lineage-language";

const TEXT = {
  es: {
    eyebrow: "Lineage",
    title: "Panel admin",
    subtitle:
      "Seleccioná el área que querés administrar. Desde acá vas a poder cargar, editar e importar información interna de Lineage.",
    newsAdmin: "Noticias - Admin",
    newsText:
      "Crear, editar, publicar y administrar noticias en español, portugués e inglés.",
    bloodRacesAdmin: "Bloodstock-Carreras - Admin",
    bloodRacesText:
      "Importar y administrar caballos, pedigrees, jockeys, carreras, hipódromos y datos deportivos.",
    open: "Abrir panel",
    back: "Volver al sitio",
  },
  pt: {
    eyebrow: "Lineage",
    title: "Painel admin",
    subtitle:
      "Selecione a área que deseja administrar. A partir daqui você poderá carregar, editar e importar informações internas da Lineage.",
    newsAdmin: "Notícias - Admin",
    newsText:
      "Criar, editar, publicar e administrar notícias em espanhol, português e inglês.",
    bloodRacesAdmin: "Bloodstock-Corridas - Admin",
    bloodRacesText:
      "Importar e administrar cavalos, pedigrees, jóqueis, corridas, hipódromos e dados esportivos.",
    open: "Abrir painel",
    back: "Voltar ao site",
  },
  en: {
    eyebrow: "Lineage",
    title: "Admin panel",
    subtitle:
      "Choose the area you want to manage. From here you can create, edit and import internal Lineage information.",
    newsAdmin: "News - Admin",
    newsText:
      "Create, edit, publish and manage news in Spanish, Portuguese and English.",
    bloodRacesAdmin: "Bloodstock-Races - Admin",
    bloodRacesText:
      "Import and manage horses, pedigrees, jockeys, races, racetracks and sport data.",
    open: "Open panel",
    back: "Back to site",
  },
};

export default function PanelAdminPage() {
  const { language } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;

  const cards = [
    {
      title: t.newsAdmin,
      text: t.newsText,
      href: "/paneladmin/noticias",
    },
    {
      title: t.bloodRacesAdmin,
      text: t.bloodRacesText,
      href: "/paneladmin/blood-races",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f1e5] px-5 py-12 text-[#2b140f]">
      <section className="mx-auto max-w-6xl">
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
            href="/"
            className="border border-[#8b0d0d] bg-[#fbf6ec] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] transition hover:bg-[#8b0d0d] hover:text-white"
          >
            {t.back}
          </Link>
        </div>

        <div className="h-[2px] w-full bg-[#8b0d0d]" />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group border border-[#e5d3bd] bg-[#fffaf1] p-7 shadow-sm transition hover:border-[#8b0d0d]"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#8b0d0d] bg-[#8b0d0d] text-xl font-semibold text-white">
                +
              </div>

              <h2 className="text-2xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
                {card.title}
              </h2>

              <p className="mt-4 min-h-[88px] text-sm leading-7 text-[#6f5b50]">
                {card.text}
              </p>

              <span className="mt-6 inline-flex border border-[#8b0d0d] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] transition group-hover:bg-[#8b0d0d] group-hover:text-white">
                {t.open}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}