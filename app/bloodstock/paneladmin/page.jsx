"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useLineageLanguage } from "../../components/use-lineage-language";

const TEXT = {
  es: {
    loading: "Verificando acceso...",
    noAccessTitle: "Acceso restringido",
    noAccessText:
      "Este panel es solo para administradores de Lineage Bloodstock.",
    back: "Volver a Bloodstock",
    eyebrow: "Bloodstock",
    title: "Panel admin",
    subtitle:
      "Desde acá vas a poder importar y administrar caballos, pedigrees, jockeys, carreras y datos internos de Lineage.",
    importPedigree: "Importar Pedigree Query",
    importPedigreeText:
      "Buscar caballos en Pedigree Query, traer pedigree, padre, madre, abuelo materno y relaciones.",
    horses: "Caballos",
    horsesText:
      "Ver, editar y controlar los caballos cargados en la base de Lineage.",
    races: "Carreras",
    racesText:
      "Importar o cargar carreras, resultados, hipódromos y datos deportivos.",
    jockeys: "Jockeys",
    jockeysText:
      "Administrar jockeys, estadísticas y datos relacionados.",
    stats: "Estadísticas",
    statsText:
      "Control interno de rankings, datos importados y reportes de bloodstock.",
    open: "Abrir",
  },
  pt: {
    loading: "Verificando acesso...",
    noAccessTitle: "Acesso restrito",
    noAccessText:
      "Este painel é somente para administradores de Lineage Bloodstock.",
    back: "Voltar para Bloodstock",
    eyebrow: "Bloodstock",
    title: "Painel admin",
    subtitle:
      "A partir daqui você poderá importar e administrar cavalos, pedigrees, jóqueis, corridas e dados internos da Lineage.",
    importPedigree: "Importar Pedigree Query",
    importPedigreeText:
      "Buscar cavalos no Pedigree Query, trazer pedigree, pai, mãe, avô materno e relações.",
    horses: "Cavalos",
    horsesText:
      "Ver, editar e controlar os cavalos carregados na base da Lineage.",
    races: "Corridas",
    racesText:
      "Importar ou carregar corridas, resultados, hipódromos e dados esportivos.",
    jockeys: "Jóqueis",
    jockeysText:
      "Administrar jóqueis, estatísticas e dados relacionados.",
    stats: "Estatísticas",
    statsText:
      "Controle interno de rankings, dados importados e relatórios de bloodstock.",
    open: "Abrir",
  },
  en: {
    loading: "Checking access...",
    noAccessTitle: "Restricted access",
    noAccessText:
      "This panel is only for Lineage Bloodstock administrators.",
    back: "Back to Bloodstock",
    eyebrow: "Bloodstock",
    title: "Admin panel",
    subtitle:
      "From here you can import and manage horses, pedigrees, jockeys, races and internal Lineage data.",
    importPedigree: "Import Pedigree Query",
    importPedigreeText:
      "Search horses on Pedigree Query and import pedigree, sire, dam, damsire and relations.",
    horses: "Horses",
    horsesText:
      "View, edit and control horses loaded into the Lineage database.",
    races: "Races",
    racesText:
      "Import or create races, results, racetracks and sport data.",
    jockeys: "Jockeys",
    jockeysText:
      "Manage jockeys, statistics and related data.",
    stats: "Statistics",
    statsText:
      "Internal control for rankings, imported data and bloodstock reports.",
    open: "Open",
  },
};

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey);
}

function getAdminEmails() {
  return String(process.env.NEXT_PUBLIC_LINEAGE_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export default function BloodstockPanelAdminPage() {
  const { language } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      try {
        const supabase = getSupabaseClient();

        if (!supabase) {
          if (mounted) {
            setIsAdmin(false);
            setChecking(false);
          }
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        const userEmail = String(user?.email || "").trim().toLowerCase();
        const adminEmails = getAdminEmails();

        if (mounted) {
          setIsAdmin(Boolean(userEmail && adminEmails.includes(userEmail)));
          setChecking(false);
        }
      } catch {
        if (mounted) {
          setIsAdmin(false);
          setChecking(false);
        }
      }
    }

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return (
      <main className="min-h-screen bg-[#f8f1e5] px-5 py-16 text-[#2b140f]">
        <section className="mx-auto max-w-5xl border border-[#e5d3bd] bg-[#fffaf1] p-8 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
            {t.loading}
          </p>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#f8f1e5] px-5 py-16 text-[#2b140f]">
        <section className="mx-auto max-w-5xl border border-[#e5d3bd] bg-[#fffaf1] p-8 text-center shadow-sm">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
            Lineage Bloodstock
          </p>

          <h1 className="text-3xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
            {t.noAccessTitle}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#6f5b50]">
            {t.noAccessText}
          </p>

          <Link
            href="/bloodstock/consultas"
            className="mt-7 inline-flex border border-[#8b0d0d] bg-[#8b0d0d] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#6f0909]"
          >
            {t.back}
          </Link>
        </section>
      </main>
    );
  }

  const cards = [
    {
      title: t.importPedigree,
      text: t.importPedigreeText,
      href: "/bloodstock/paneladmin/importar-pedigree",
    },
    {
      title: t.horses,
      text: t.horsesText,
      href: "/bloodstock/paneladmin/caballos",
    },
    {
      title: t.races,
      text: t.racesText,
      href: "/bloodstock/paneladmin/carreras",
    },
    {
      title: t.jockeys,
      text: t.jockeysText,
      href: "/bloodstock/paneladmin/jockeys",
    },
    {
      title: t.stats,
      text: t.statsText,
      href: "/bloodstock/paneladmin/estadisticas",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f1e5] px-5 py-12 text-[#2b140f]">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8b0d0d]">
              {t.eyebrow}
            </p>

            <h1 className="text-4xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d] md:text-5xl">
              {t.title}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#6f5b50] md:text-base">
              {t.subtitle}
            </p>
          </div>

          <Link
            href="/bloodstock/consultas"
            className="border border-[#8b0d0d] bg-[#fbf6ec] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] transition hover:bg-[#8b0d0d] hover:text-white"
          >
            {t.back}
          </Link>
        </div>

        <div className="h-[2px] w-full bg-[#8b0d0d]" />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group border border-[#e5d3bd] bg-[#fffaf1] p-6 shadow-sm transition hover:border-[#8b0d0d]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center border border-[#8b0d0d] bg-[#8b0d0d] text-lg font-semibold text-white">
                +
              </div>

              <h2 className="text-xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
                {card.title}
              </h2>

              <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#6f5b50]">
                {card.text}
              </p>

              <span className="mt-5 inline-flex border border-[#8b0d0d] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] transition group-hover:bg-[#8b0d0d] group-hover:text-white">
                {t.open}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}