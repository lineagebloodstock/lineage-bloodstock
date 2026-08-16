"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { useLineageLanguage } from "../../components/use-lineage-language";

const TEXT = {
  es: {
    loading: "Cargando noticia...",
    back: "Volver a noticias",
    notFound: "No encontramos esta noticia.",
    newsroom: "Newsroom",
    date: "Fecha",
    region: "Región",
    tags: "Etiquetas",
    bloodstock: "Bloodstock",
    close: "Cerrar",
    goToHorse: "Ir a ficha Bloodstock",
  },
  pt: {
    loading: "Carregando notícia...",
    back: "Voltar para notícias",
    notFound: "Não encontramos esta notícia.",
    newsroom: "Newsroom",
    date: "Data",
    region: "Região",
    tags: "Etiquetas",
    bloodstock: "Bloodstock",
    close: "Fechar",
    goToHorse: "Ir para ficha Bloodstock",
  },
  en: {
    loading: "Loading news...",
    back: "Back to news",
    notFound: "We could not find this news item.",
    newsroom: "Newsroom",
    date: "Date",
    region: "Region",
    tags: "Tags",
    bloodstock: "Bloodstock",
    close: "Close",
    goToHorse: "Go to Bloodstock page",
  },
};

function getTranslation(article, language) {
  const translations =
    article?.translations || article?.lineage_news_translations || [];

  return (
    translations.find((item) => item.language === language) ||
    translations.find((item) => item.language === "es") ||
    translations[0] ||
    {}
  );
}

function formatDate(value, language) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat(language || "es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export default function NoticiaDetallePage() {
  const params = useParams();
  const slug = params?.slug;

  const { language } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [horseModal, setHorseModal] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadArticle() {
      if (!slug) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("lineage_news")
        .select(
          `
          *,
          translations:lineage_news_translations(*)
        `
        )
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (!isMounted) return;

      if (error) {
        console.error("Error loading article:", error);
        setArticle(null);
      } else {
        setArticle(data || null);
      }

      setLoading(false);
    }

    loadArticle();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const translation = useMemo(() => {
    return getTranslation(article, language);
  }, [article, language]);

  const date = formatDate(
    article?.published_at || article?.created_at,
    language
  );

  function handleArticleClick(event) {
    const mention = event.target.closest?.(".lineage-horse-mention");

    if (!mention) return;

    event.preventDefault();

    setHorseModal({
      name: mention.dataset.horseName || mention.textContent || "",
      slug: mention.dataset.horseSlug || "",
      pedigree: mention.dataset.pedigree || "",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f1e6] px-5 py-10 text-[#1b0909]">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
          {t.loading}
        </p>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-[#f7f1e6] px-5 py-10 text-[#1b0909]">
        <div className="mx-auto max-w-4xl border-2 border-[#8b0d0d] bg-[#fbf6ec] p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b0d0d]">
            Lineage Bloodstock
          </p>

          <h1 className="article-title mt-3 text-4xl text-[#1b0909]">
            {t.notFound}
          </h1>

          <Link
            href="/noticias"
            className="mt-6 inline-flex border border-[#8b0d0d] bg-[#8b0d0d] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white"
          >
            ← {t.back}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1e6] text-[#1b0909]">
      <section className="border-b border-[#8b0d0d] bg-[#8b0d0d] px-5 py-9 text-white">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/noticias"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75"
          >
            ← {t.back}
          </Link>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
            {t.newsroom}
          </p>

          <h1 className="article-title mt-4 max-w-5xl text-4xl text-white md:text-6xl">
            {translation.title || article.slug}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {article.region
            ? String(article.region)
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
                .map((item) => (
                  <span
                    key={item}
                    className="bg-[#8b0d0d] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white"
                  >
                    {item}
                  </span>
                ))
            : null}

          {date ? (
            <span className="border border-[#8b0d0d] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8b0d0d]">
              {date}
            </span>
          ) : null}
        </div>

        {Array.isArray(article.tags) && article.tags.length ? (
          <div className="mb-7 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="border border-[#8b0d0d] bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8b0d0d]"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <article
          onClick={handleArticleClick}
          className="border-2 border-[#8b0d0d] bg-white p-5 md:p-8"
        >
          <div
            className="lineage-article-content article-body text-lg leading-9 text-[#1b0909]"
            dangerouslySetInnerHTML={{ __html: translation.content || "" }}
          />
        </article>
      </section>

      {horseModal ? (
        <HorseModal
          horse={horseModal}
          t={t}
          onClose={() => setHorseModal(null)}
        />
      ) : null}

      <style jsx global>{`
        .lineage-article-content img {
          max-width: 100%;
          height: auto;
        }

        .lineage-article-content iframe {
          pointer-events: auto !important;
        }

        .lineage-article-content .lineage-resizable-media {
          max-width: 100%;
        }

        .lineage-article-content .lineage-resizable-media iframe {
          pointer-events: auto !important;
        }

        .lineage-article-content blockquote {
          border-left: 4px solid #8b0d0d;
          margin: 24px 0;
          padding: 12px 18px;
          background: #f7f1e6;
          color: #4f342c;
          font-style: italic;
        }

        .lineage-article-content a {
          color: #8b0d0d;
          text-decoration: underline;
          font-weight: 700;
        }

        .lineage-article-content h2 {
          margin-top: 32px;
          margin-bottom: 14px;
          font-size: 32px;
          line-height: 1.15;
          color: #1b0909;
        }

        .lineage-article-content h3 {
          margin-top: 26px;
          margin-bottom: 12px;
          font-size: 24px;
          line-height: 1.2;
          color: #1b0909;
        }

        .lineage-article-content p {
          margin: 0 0 18px;
        }
      `}</style>
    </main>
  );
}

function HorseModal({ horse, t, onClose }) {
  const href = horse.slug ? `/bloodstock/${horse.slug}` : "/bloodstock";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg border-2 border-[#8b0d0d] bg-[#fbf6ec] p-6">
        <div className="flex items-start justify-between gap-4 border-b border-[#c9b89d] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
              {t.bloodstock}
            </p>

            <h2 className="article-title mt-2 text-3xl text-[#1b0909]">
              {horse.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]"
          >
            {t.close}
          </button>
        </div>

        {horse.pedigree ? (
          <p className="mt-5 text-base leading-7 text-[#4f342c]">
            {horse.pedigree}
          </p>
        ) : null}

        <Link
          href={href}
          className="mt-6 inline-flex border border-[#8b0d0d] bg-[#8b0d0d] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white"
        >
          {t.goToHorse}
        </Link>
      </div>
    </div>
  );
}
