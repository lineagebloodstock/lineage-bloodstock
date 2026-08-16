"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useLineageLanguage } from "../components/use-lineage-language";

const TEXT = {
  es: {
    loading: "Cargando noticias...",
    heroTitle: "Noticias globales de carreras, cría y bloodstock.",
    heroText:
      "Lineage Bloodstock reúne noticias internacionales, pedigrees, ventas, carreras y futuras herramientas de bloodstock en una plataforma editorial.",
    newsroom: "Newsroom",
    latestNews: "Últimas noticias",
    moreNews: "Más noticias",
    readArticle: "Leer artículo",
    readMore: "Leer más",
    noNews: "Todavía no hay noticias publicadas.",
    footerRights: "Todos los derechos reservados.",
    about: "Acerca de",
    contact: "Contacto",
    instagram: "Instagram",
    searchPlaceholder: "Buscar noticias",
    filters: [
      { key: "all", label: "Todos" },
      { key: "north-america", label: "América del Norte" },
      { key: "south-america", label: "América del Sur" },
      { key: "europe", label: "Europa" },
      { key: "middle-east", label: "Medio Oriente" },
      { key: "asia-oceania", label: "Asia / Oceanía" },
    ],
  },
  pt: {
    loading: "Carregando notícias...",
    heroTitle: "Notícias globais de corridas, criação e bloodstock.",
    heroText:
      "Lineage Bloodstock reúne notícias internacionais, pedigrees, vendas, corridas e futuras ferramentas de bloodstock em uma plataforma editorial.",
    newsroom: "Newsroom",
    latestNews: "Últimas noticias",
    moreNews: "Mais notícias",
    readArticle: "Ler artigo",
    readMore: "Ler mais",
    noNews: "Ainda não há notícias publicadas.",
    footerRights: "Todos os direitos reservados.",
    about: "Sobre",
    contact: "Contato",
    instagram: "Instagram",
    searchPlaceholder: "Buscar notícias",
    filters: [
      { key: "all", label: "Todos" },
      { key: "north-america", label: "América do Norte" },
      { key: "south-america", label: "América do Sul" },
      { key: "europe", label: "Europa" },
      { key: "middle-east", label: "Oriente Médio" },
      { key: "asia-oceania", label: "Ásia / Oceania" },
    ],
  },
  en: {
    loading: "Loading news...",
    heroTitle: "Global racing, breeding and bloodstock news.",
    heroText:
      "Lineage Bloodstock brings together international news, pedigrees, sales, racing updates and future bloodstock tools in one editorial platform.",
    newsroom: "Newsroom",
    latestNews: "Latest News",
    moreNews: "More News",
    readArticle: "Read article",
    readMore: "Read more",
    noNews: "There are no published news yet.",
    footerRights: "All rights reserved.",
    about: "About",
    contact: "Contact",
    instagram: "Instagram",
    searchPlaceholder: "Search news",
    filters: [
      { key: "all", label: "All" },
      { key: "north-america", label: "North America" },
      { key: "south-america", label: "South America" },
      { key: "europe", label: "Europe" },
      { key: "middle-east", label: "Middle East" },
      { key: "asia-oceania", label: "Asia / Oceania" },
    ],
  },
};

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeRegion(value) {
  const safe = normalizeText(value);

  if (!safe) return "";

  if (
    safe.includes("north") ||
    safe.includes("norte") ||
    safe.includes("usa") ||
    safe.includes("united states") ||
    safe.includes("canada") ||
    safe.includes("mexico")
  ) {
    return "north-america";
  }

  if (
    safe.includes("south") ||
    safe.includes("sul") ||
    safe.includes("sur") ||
    safe.includes("argentina") ||
    safe.includes("uruguay") ||
    safe.includes("brasil") ||
    safe.includes("brazil") ||
    safe.includes("chile") ||
    safe.includes("peru")
  ) {
    return "south-america";
  }

  if (
    safe.includes("europe") ||
    safe.includes("europa") ||
    safe.includes("england") ||
    safe.includes("ireland") ||
    safe.includes("france") ||
    safe.includes("italy") ||
    safe.includes("espana") ||
    safe.includes("spain")
  ) {
    return "europe";
  }

  if (
    safe.includes("middle") ||
    safe.includes("medio") ||
    safe.includes("oriente") ||
    safe.includes("dubai") ||
    safe.includes("uae") ||
    safe.includes("emirates") ||
    safe.includes("qatar") ||
    safe.includes("saudi")
  ) {
    return "middle-east";
  }

  if (
    safe.includes("asia") ||
    safe.includes("oceania") ||
    safe.includes("japan") ||
    safe.includes("japao") ||
    safe.includes("japon") ||
    safe.includes("australia") ||
    safe.includes("new zealand")
  ) {
    return "asia-oceania";
  }

  return safe;
}

function getArticleRegionKeys(article) {
  const rawRegion = String(article?.region || "");

  return rawRegion
    .split(/[,;|]/)
    .map((item) => normalizeRegion(item))
    .filter(Boolean);
}

function articleMatchesRegion(article, activeRegion) {
  if (activeRegion === "all") return true;
  return getArticleRegionKeys(article).includes(activeRegion);
}

function getRegionLabels(article, t) {
  const rawRegion = String(article?.region || "");

  if (!rawRegion.trim()) return [];

  const rawParts = rawRegion
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const filters = t.filters || [];

  const labels = rawParts.map((region) => {
    const key = normalizeRegion(region);
    const found = filters.find((filter) => filter.key === key);
    return found?.label || region;
  });

  return [...new Set(labels.filter(Boolean))];
}

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

function getPublishedDate(article, language) {
  return formatDate(article?.published_at, language);
}

function getFirstImageFromHtml(html) {
  const source = String(html || "");
  const match = source.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return match?.[1] || "";
}

function getArticleImage(article, language) {
  const translation = getTranslation(article, language);
  return article?.image_url || getFirstImageFromHtml(translation.content) || "";
}

function getArticleHref(article) {
  return `/noticias/${article.slug}`;
}

function articleMatchesSearch(article, language, query) {
  const safeQuery = normalizeText(query);
  if (!safeQuery) return true;

  const translation = getTranslation(article, language);
  const haystack = normalizeText(
    [
      article?.slug,
      article?.region,
      translation?.title,
      translation?.summary,
      translation?.content,
      Array.isArray(article?.tags) ? article.tags.join(" ") : "",
    ].join(" ")
  );

  return haystack.includes(safeQuery);
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function RegionLabels({ article, t }) {
  const labels = getRegionLabels(article, t);

  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 lg:flex-nowrap">
      {labels.map((label) => (
        <span
          key={label}
          className="bg-[#8b0d0d] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export default function NoticiasPage() {
  const { language } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;

  const [activeRegion, setActiveRegion] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      setLoading(true);
      await loadPublishedNews();

      if (isMounted) setLoading(false);
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadPublishedNews() {
    const { data, error } = await supabase
      .from("lineage_news")
      .select(
        `
        *,
        translations:lineage_news_translations(*)
      `
      )
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (!error) setNews(data || []);
    else setNews([]);
  }

  const publishedNews = useMemo(() => {
    return news.filter((item) => item.status === "published");
  }, [news]);

  const filteredNews = useMemo(() => {
    return publishedNews.filter(
      (item) =>
        articleMatchesRegion(item, activeRegion) &&
        articleMatchesSearch(item, language, searchQuery)
    );
  }, [publishedNews, activeRegion, language, searchQuery]);

  const mainArticle = filteredNews[0] || null;
  const topStories = filteredNews.slice(1, 5);
  const moreNews = filteredNews.slice(5);

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

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-7 flex flex-col justify-between gap-5 border-b-2 border-[#8b0d0d] pb-5 lg:flex-row lg:items-end">
          <div className="w-full max-w-[300px] shrink-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-[#8b0d0d]">
              {t.newsroom}
            </p>

            <label className="group flex w-full items-center gap-3 border-b-2 border-[#8b0d0d] pb-2">
              <span className="text-[#8b0d0d] transition group-focus-within:scale-110">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent py-1.5 text-[13px] font-medium normal-case tracking-normal text-[#1b0909] outline-none placeholder:text-[#8b0d0d]/45"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {t.filters.map((filter) => {
              const isActive = activeRegion === filter.key;

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveRegion(filter.key)}
                  className={
                    isActive
                      ? "border border-[#8b0d0d] bg-[#8b0d0d] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
                      : "border border-[#8b0d0d] bg-[#fbf6ec] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] hover:bg-[#8b0d0d] hover:text-white"
                  }
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <p className="border border-[#8b0d0d] bg-[#fbf6ec] p-5 text-sm font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
            {t.loading}
          </p>
        ) : filteredNews.length === 0 ? (
          <p className="border border-[#8b0d0d] bg-[#fbf6ec] p-5 text-sm font-semibold text-[#8b0d0d]">
            {t.noNews}
          </p>
        ) : (
          <div className="grid items-start gap-7 lg:grid-cols-[1.35fr_0.75fr]">
            {mainArticle ? (
              <MainArticle article={mainArticle} language={language} t={t} />
            ) : null}

            <aside className="border-2 border-[#8b0d0d] bg-[#fbf6ec]">
              <div className="border-b-2 border-[#8b0d0d] bg-[#8b0d0d] px-5 py-4 text-white">
                <h3 className="article-title text-2xl text-white">
                  {t.moreNews}
                </h3>
              </div>

              {topStories.length === 0 ? (
                <p className="p-5 text-sm text-[#4f342c]">{t.noNews}</p>
              ) : (
                topStories.map((story) => (
                  <SmallStory
                    key={story.id}
                    article={story}
                    language={language}
                    t={t}
                  />
                ))
              )}
            </aside>
          </div>
        )}
      </section>

      {moreNews.length > 0 ? (
        <section className="mx-auto max-w-7xl px-5 pb-12">
          <div className="mb-6 border-b-2 border-[#8b0d0d] pb-4">
            <h2 className="article-title text-3xl text-[#1b0909]">
              {t.moreNews}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {moreNews.map((item) => (
              <NewsCard
                key={item.id}
                article={item}
                language={language}
                t={t}
              />
            ))}
          </div>
        </section>
      ) : null}

      <footer className="border-t-2 border-[#8b0d0d] bg-[#8b0d0d] px-5 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm font-semibold md:flex-row">
          <p>© 2026 Lineage Bloodstock. {t.footerRights}</p>

          <div className="flex flex-wrap gap-6 uppercase tracking-[0.12em]">
            <Link href="#">{t.about}</Link>
            <a href="mailto:lineagebloodstock@gmail.com">{t.contact}</a>
            <Link href="#">{t.instagram}</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function MainArticle({ article, language, t }) {
  const translation = getTranslation(article, language);
  const date = getPublishedDate(article, language);
  const image = getArticleImage(article, language);

  return (
    <Link
      href={getArticleHref(article)}
      className="block self-start border-2 border-[#8b0d0d] bg-[#fbf6ec] transition hover:bg-[#f2e7d6]"
    >
      <article>
        <div className="grid items-stretch md:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-[#8b0d0d] p-5 md:flex md:border-b-0 md:border-r">
            {image ? (
              <img
                src={image}
                alt={translation.title || article.slug}
                className="aspect-[16/10] w-full object-cover md:aspect-auto md:h-auto md:max-h-[340px]"
              />
            ) : (
              <div className="flex aspect-[16/10] w-full items-center justify-center bg-[#2b1712] text-center text-xs font-semibold uppercase tracking-[0.24em] text-white/35 md:min-h-[210px]">
                Lineage Bloodstock
              </div>
            )}
          </div>

          <div className="p-5 md:p-7">
            <div className="mb-5">
              <RegionLabels article={article} t={t} />
            </div>

            <h3 className="article-title text-3xl text-[#1b0909] md:text-5xl">
              {translation.title || article.slug}
            </h3>

            {translation.summary ? (
              <p className="article-body mt-5 text-lg leading-8 text-[#4f342c]">
                {translation.summary}
              </p>
            ) : null}

            <div className="mt-7 flex flex-col justify-between gap-4 border-t border-[#c9b89d] pt-5 sm:flex-row sm:items-center">
              {date ? (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b0d0d]">
                  {date}
                </p>
              ) : (
                <span />
              )}

              <span className="inline-flex border border-[#8b0d0d] bg-[#8b0d0d] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                {t.readArticle} →
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function SmallStory({ article, language, t }) {
  const translation = getTranslation(article, language);
  const image = getArticleImage(article, language);
  const date = getPublishedDate(article, language);

  return (
    <Link
      href={getArticleHref(article)}
      className="block border-b border-[#c9b89d] p-5 transition hover:bg-[#f2e7d6] last:border-b-0"
    >
      <article>
        {image ? (
          <img src={image} alt="" className="mb-4 h-[115px] w-full object-cover" />
        ) : null}

        <div className="mb-3">
          <RegionLabels article={article} t={t} />
        </div>

        <h4 className="article-title text-xl text-[#1b0909]">
          {translation.title || article.slug}
        </h4>

        <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          {date ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
              {date}
            </p>
          ) : (
            <span />
          )}

          <span className="inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
            {t.readMore} →
          </span>
        </div>
      </article>
    </Link>
  );
}

function NewsCard({ article, language, t }) {
  const translation = getTranslation(article, language);
  const date = getPublishedDate(article, language);
  const image = getArticleImage(article, language);

  return (
    <Link
      href={getArticleHref(article)}
      className="block border border-[#8b0d0d] bg-[#fbf6ec] transition hover:bg-[#f2e7d6]"
    >
      <article>
        {image ? (
          <img
            src={image}
            alt={translation.title || article.slug}
            className="h-[210px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[210px] items-center justify-center bg-[#2b1712] text-center text-xs font-semibold uppercase tracking-[0.22em] text-white/35">
            Lineage Bloodstock
          </div>
        )}

        <div className="p-5">
          <div className="mb-4">
            <RegionLabels article={article} t={t} />
          </div>

          <h3 className="article-title min-h-[90px] text-2xl text-[#1b0909]">
            {translation.title || article.slug}
          </h3>

          {translation.summary ? (
            <p className="mt-4 text-sm leading-6 text-[#4f342c]">
              {translation.summary}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            {date ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
                {date}
              </p>
            ) : (
              <span />
            )}

            <span className="inline-flex border border-[#8b0d0d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
              {t.readMore}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}