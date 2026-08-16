"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLineageLanguage } from "./use-lineage-language";
import { supabase } from "../lib/supabaseClient";

const TEXT = {
  es: {
    news: "Noticias",
    bloodstock: "Bloodstock",
    races: "Carreras",
    login: "Ingresar",
    logout: "Salir",
  },
  pt: {
    news: "Notícias",
    bloodstock: "Bloodstock",
    races: "Corridas",
    login: "Entrar",
    logout: "Sair",
  },
  en: {
    news: "News",
    bloodstock: "Bloodstock",
    races: "Races",
    login: "Login",
    logout: "Logout",
  },
};

const LANGUAGES = ["es", "pt", "en"];

function getUserDisplayName(user) {
  if (!user) return "";

  const metadataName =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.display_name;

  if (metadataName) return metadataName;
  if (user.email) return user.email.split("@")[0];

  return "";
}

function normalizeLanguage(value) {
  if (LANGUAGES.includes(value)) return value;
  return "es";
}

function getAdminEmails() {
  return String(process.env.NEXT_PUBLIC_LINEAGE_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function checkIsAdmin(user) {
  const userEmail = String(user?.email || "").trim().toLowerCase();
  const adminEmails = getAdminEmails();

  return Boolean(userEmail && adminEmails.includes(userEmail));
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { language, setLanguage } = useLineageLanguage();

  const [selectedLanguage, setSelectedLanguage] = useState(
    normalizeLanguage(language)
  );
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  const isAccessPage =
    pathname === "/acceso-lineage" ||
    pathname.startsWith("/acceso-lineage/") ||
    pathname === "/acceso" ||
    pathname.startsWith("/acceso/");

  useEffect(() => {
    const nextLanguage = normalizeLanguage(language);
    setSelectedLanguage(nextLanguage);
  }, [language]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user || null;

      if (isMounted) {
        setUserName(getUserDisplayName(currentUser));
        setIsAdmin(checkIsAdmin(currentUser));
        setAuthLoaded(true);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;

      setUserName(getUserDisplayName(currentUser));
      setIsAdmin(checkIsAdmin(currentUser));
      setAuthLoaded(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isAccessPage) {
    return null;
  }

  function changeLanguage(nextLanguage) {
    const safeLanguage = normalizeLanguage(nextLanguage);

    setSelectedLanguage(safeLanguage);
    setLanguage(safeLanguage);

    if (typeof window !== "undefined") {
      localStorage.setItem("lineage_language", safeLanguage);
      localStorage.setItem("lineageLanguage", safeLanguage);

      window.dispatchEvent(
        new CustomEvent("lineage-language-change", {
          detail: safeLanguage,
        })
      );
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserName("");
    setIsAdmin(false);
    window.location.href = "/noticias";
  }

  const t = TEXT[selectedLanguage] || TEXT.es;

  const loginHref = `/acceso-lineage?from=${encodeURIComponent(
    pathname || "/noticias"
  )}`;

  return (
    <header className="sticky top-0 z-[70] border-b border-[#8b0d0d] bg-[#fbf6ec] shadow-[0_2px_10px_rgba(27,9,9,0.08)]">
      <div className="mx-auto max-w-7xl px-5 py-7">
        <div className="grid items-center gap-6 md:grid-cols-[120px_1fr_120px]">
          <div className="flex flex-col items-start gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => changeLanguage(lang)}
                className={`w-16 border border-[#8b0d0d] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  selectedLanguage === lang
                    ? "bg-[#8b0d0d] text-white"
                    : "bg-[#fbf6ec] text-[#8b0d0d] hover:bg-[#f2e7d6]"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <Link href="/noticias" className="block text-center">
            <p className="font-display text-[48px] font-extrabold uppercase leading-[0.82] tracking-[-0.06em] text-[#8b0d0d] md:text-[78px]">
              Lineage
            </p>

            <p className="font-display text-[26px] font-bold uppercase leading-none tracking-[0.18em] text-[#8b0d0d] md:text-[36px]">
              Bloodstock
            </p>
          </Link>

          <div className="flex h-full min-h-[54px] w-[120px] items-center justify-center md:justify-end">
            {!authLoaded ? (
              <div className="h-[32px] w-[96px]" />
            ) : userName ? (
              <div className="flex w-[120px] flex-col items-center gap-1 md:items-end">
                {isAdmin ? (
                  <Link
                    href="/paneladmin"
                    aria-label="Abrir panel de administración"
                    title="Abrir panel de administración"
                    className="w-[120px] border border-[#8b0d0d] bg-[#fbf6ec] px-3 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d] transition hover:bg-[#8b0d0d] hover:text-white"
                  >
                    PANEL
                  </Link>
                ) : null}

                <div className="w-[120px] truncate border border-[#8b0d0d] bg-[#8b0d0d] px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                  {userName}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <Link
                href={loginHref}
                className="w-[96px] border border-[#8b0d0d] bg-[#8b0d0d] px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-white"
              >
                {t.login}
              </Link>
            )}
          </div>
        </div>


      </div>
    </header>
  );
}
