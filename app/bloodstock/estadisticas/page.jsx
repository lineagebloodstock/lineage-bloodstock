"use client";

import Link from "next/link";
import { useLineageLanguage } from "../../components/use-lineage-language";
import BloodstockSubnav from "../components/BloodstockSubnav";

const TEXT = {
  es: {
    heroTitle: "Estadísticas de bloodstock.",
    heroText:
      "Próximamente esta sección permitirá analizar padrillos, abuelos maternos, familias maternas, distancias, superficies y resultados conectados con carreras.",
    comingSoon: "Módulo en preparación",
    intro:
      "Esta pantalla confirma que la ruta de Estadísticas funciona correctamente. Luego vamos a conectarla con la base de carreras y bloodstock.",
    blocks: [
      {
        title: "Padrillos",
        text: "Ranking por hijos corredores, ganadores, black type, rating promedio y distancia ideal.",
      },
      {
        title: "Abuelos maternos",
        text: "Comparación de rendimiento por padrillo, línea paterna, distancia y superficie.",
      },
      {
        title: "Familias maternas",
        text: "Análisis de producción, repetición de patrones, precocidad y rendimiento por país.",
      },
      {
        title: "Cruces efectivos",
        text: "Estadísticas de padrillo x abuelo materno, línea paterna x línea materna y patrones similares.",
      },
    ],
  },

  pt: {
    heroTitle: "Estatísticas de bloodstock.",
    heroText:
      "Em breve esta seção permitirá analisar garanhões, avôs maternos, famílias maternas, distâncias, superfícies e resultados conectados com corridas.",
    comingSoon: "Módulo em preparação",
    intro:
      "Esta tela confirma que a rota de Estatísticas funciona corretamente. Depois vamos conectá-la com a base de corridas e bloodstock.",
    blocks: [
      {
        title: "Garanhões",
        text: "Ranking por filhos corredores, ganhadores, black type, rating médio e distância ideal.",
      },
      {
        title: "Avôs maternos",
        text: "Comparação de rendimento por garanhão, linha paterna, distância e superfície.",
      },
      {
        title: "Famílias maternas",
        text: "Análise de produção, repetição de padrões, precocidade e desempenho por país.",
      },
      {
        title: "Cruzamentos efetivos",
        text: "Estatísticas de garanhão x avô materno, linha paterna x linha materna e padrões similares.",
      },
    ],
  },

  en: {
    heroTitle: "Bloodstock statistics.",
    heroText:
      "Soon this section will analyze stallions, damsires, maternal families, distances, surfaces and results connected with racing.",
    comingSoon: "Module in preparation",
    intro:
      "This screen confirms that the Statistics route works correctly. Later we will connect it with the racing and bloodstock database.",
    blocks: [
      {
        title: "Stallions",
        text: "Ranking by runners, winners, black type, average rating and ideal distance.",
      },
      {
        title: "Damsires",
        text: "Performance comparison by stallion, sire line, distance and surface.",
      },
      {
        title: "Maternal families",
        text: "Analysis of production, pattern repetition, precocity and performance by country.",
      },
      {
        title: "Effective crosses",
        text: "Statistics for sire x damsire, sire line x maternal line and similar patterns.",
      },
    ],
  },
};

export default function BloodstockEstadisticasPage() {
  const { language } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;

  return (
    <main className="min-h-screen bg-[#f7f1e6] text-[#1b0909]">
      <section className="border-b border-[#c9b89d] bg-[#8b0d0d] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h1 className="article-title max-w-4xl text-4xl text-white md:text-6xl">
              {t.heroTitle}
            </h1>
          </div>

          <div>
            <p className="max-w-xl text-base font-medium leading-7 text-white/80">
              {t.heroText}
            </p>
          </div>
        </div>
      </section>

      <BloodstockSubnav />

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-7 border-b-2 border-[#8b0d0d] pb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#8b0d0d]">
            {t.comingSoon}
          </p>

          <h2 className="article-title text-3xl text-[#1b0909] md:text-5xl">
            {t.heroTitle}
          </h2>

          <p className="mt-5 max-w-3xl text-sm font-semibold leading-7 text-[#4f342c]">
            {t.intro}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {t.blocks.map((block) => (
            <article
              key={block.title}
              className="border border-[#8b0d0d] bg-[#fbf6ec] p-5"
            >
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b0d0d]">
                Bloodstock
              </p>

              <h3 className="article-title text-3xl leading-none text-[#1b0909]">
                {block.title}
              </h3>

              <p className="mt-5 text-sm leading-7 text-[#4f342c]">
                {block.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-7 border border-[#8b0d0d] bg-[#fbf6ec] p-5">
          <p className="text-sm font-semibold leading-7 text-[#8b0d0d]">
            Esta página ya queda lista para probar navegación: Bloodstock →
            Estadísticas. Después armamos el tablero real.
          </p>
        </div>
      </section>
    </main>
  );
}