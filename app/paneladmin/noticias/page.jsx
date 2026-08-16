"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useLineageLanguage } from "../../components/use-lineage-language";

const MEDIA_BUCKET = "lineage-news-media";

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

const TEXT = {
  es: {
    loading: "Cargando...",
    adminTitle: "Panel ADMIN",
    adminSubtitle: "Administración de noticias de Lineage Bloodstock.",
    back: "Volver al panel admin",
    accessDenied: "No tenés permiso para entrar al Panel ADMIN.",
    loginRequired: "Tenés que iniciar sesión como ADMIN.",
    publishedNews: "Noticias publicadas",
    draftNews: "En borrador",
    createNews: "Crear noticia",
    editNews: "Editar noticia",
    preview: "Previsualizar",
    close: "Cerrar",
    cancel: "Cancelar",
    insert: "Insertar",
    confirm: "Confirmar",
    edit: "Editar",
    delete: "Eliminar",
    publish: "Publicar",
    saveDraft: "Guardar como borrador",
    saveChanges: "Guardar cambios",
    saved: "Noticia guardada.",
    deleted: "Noticia eliminada.",
    error: "Hubo un error. Revisá Supabase/RLS o que estés logueada como ADMIN.",
    uploadError: "No se pudo subir el archivo. Revisá el bucket lineage-news-media y las policies de Storage.",
    required: "El título en español es obligatorio.",
    noItems: "No hay noticias en esta sección.",
    published: "Publicada",
    draft: "Borrador",
    slug: "Slug",
    category: "Categoría",
    tags: "Etiquetas",
    tagsHelp: "Escribí una etiqueta y apretá Enter. Sirven para buscar y mostrar noticias relacionadas.",
    tagPlaceholder: "Ej: Derby, Kentucky, Black Type",
    region: "Región",
    mainImage: "Imagen principal",
    uploadMainImage: "Cargar imagen principal",
    changeImage: "Cambiar imagen",
    title: "Título",
    summary: "Bajada / resumen",
    content: "Contenido",
    editor: "Editor",
    livePreview: "Vista previa",
    bold: "Negrita",
    italic: "Itálica",
    h2: "Título",
    h3: "Subtítulo",
    quote: "Cita",
    list: "Lista",
    link: "Link",
    image: "Imagen",
    video: "Video",
    horseMention: "Mencionar caballo",
    visibleText: "Texto visible",
    url: "URL",
    youtubeUrl: "Link de YouTube",
    horseName: "Nombre del caballo",
    horseSlug: "Slug / ficha en Bloodstock",
    horsePedigree: "Pedigree breve",
    goToHorse: "Ir a ficha Bloodstock",
    deleteTitle: "Eliminar noticia",
    deleteText: "¿Seguro que querés eliminar esta noticia? Esta acción no se puede deshacer.",
    selectRegion: "Seleccionar región",
    regionOptions: [
      { key: "north-america", label: "América del Norte" },
      { key: "south-america", label: "América del Sur" },
      { key: "europe", label: "Europa" },
      { key: "middle-east", label: "Medio Oriente" },
      { key: "asia-oceania", label: "Asia / Oceanía" },
    ],
  },
  pt: {
    loading: "Carregando...",
    adminTitle: "Painel ADMIN",
    adminSubtitle: "Administração de notícias da Lineage Bloodstock.",
    back: "Voltar ao painel admin",
    accessDenied: "Você não tem permissão para entrar no Painel ADMIN.",
    loginRequired: "Você precisa entrar como ADMIN.",
    publishedNews: "Notícias publicadas",
    draftNews: "Em rascunho",
    createNews: "Criar notícia",
    editNews: "Editar notícia",
    preview: "Pré-visualizar",
    close: "Fechar",
    cancel: "Cancelar",
    insert: "Inserir",
    confirm: "Confirmar",
    edit: "Editar",
    delete: "Excluir",
    publish: "Publicar",
    saveDraft: "Salvar como rascunho",
    saveChanges: "Salvar alterações",
    saved: "Notícia salva.",
    deleted: "Notícia excluída.",
    error: "Ocorreu um erro. Verifique Supabase/RLS ou se você entrou como ADMIN.",
    uploadError: "Não foi possível enviar o arquivo. Verifique o bucket lineage-news-media e as policies de Storage.",
    required: "O título em espanhol é obrigatório.",
    noItems: "Não há notícias nesta seção.",
    published: "Publicada",
    draft: "Rascunho",
    slug: "Slug",
    category: "Categoria",
    tags: "Etiquetas",
    tagsHelp: "Digite uma etiqueta e pressione Enter. Elas servem para buscar e mostrar notícias relacionadas.",
    tagPlaceholder: "Ex: Derby, Kentucky, Black Type",
    region: "Região",
    mainImage: "Imagem principal",
    uploadMainImage: "Carregar imagem principal",
    changeImage: "Trocar imagem",
    title: "Título",
    summary: "Resumo",
    content: "Conteúdo",
    editor: "Editor",
    livePreview: "Prévia",
    bold: "Negrito",
    italic: "Itálico",
    h2: "Título",
    h3: "Subtítulo",
    quote: "Citação",
    list: "Lista",
    link: "Link",
    image: "Imagem",
    video: "Vídeo",
    horseMention: "Mencionar cavalo",
    visibleText: "Texto visível",
    url: "URL",
    youtubeUrl: "Link do YouTube",
    horseName: "Nome do cavalo",
    horseSlug: "Slug / ficha em Bloodstock",
    horsePedigree: "Pedigree breve",
    goToHorse: "Ir para ficha Bloodstock",
    deleteTitle: "Excluir notícia",
    deleteText: "Tem certeza de que deseja excluir esta notícia? Esta ação não pode ser desfeita.",
    selectRegion: "Selecionar região",
    regionOptions: [
      { key: "north-america", label: "América do Norte" },
      { key: "south-america", label: "América do Sul" },
      { key: "europe", label: "Europa" },
      { key: "middle-east", label: "Oriente Médio" },
      { key: "asia-oceania", label: "Ásia / Oceania" },
    ],
  },
  en: {
    loading: "Loading...",
    adminTitle: "ADMIN panel",
    adminSubtitle: "Lineage Bloodstock news administration.",
    back: "Back to admin panel",
    accessDenied: "You do not have permission to access the ADMIN panel.",
    loginRequired: "You need to log in as ADMIN.",
    publishedNews: "Published news",
    draftNews: "Drafts",
    createNews: "Create news",
    editNews: "Edit news",
    preview: "Preview",
    close: "Close",
    cancel: "Cancel",
    insert: "Insert",
    confirm: "Confirm",
    edit: "Edit",
    delete: "Delete",
    publish: "Publish",
    saveDraft: "Save as draft",
    saveChanges: "Save changes",
    saved: "News saved.",
    deleted: "News deleted.",
    error: "Something went wrong. Check Supabase/RLS or that you are logged in as ADMIN.",
    uploadError: "The file could not be uploaded. Check the lineage-news-media bucket and Storage policies.",
    required: "The Spanish title is required.",
    noItems: "No news in this section.",
    published: "Published",
    draft: "Draft",
    slug: "Slug",
    category: "Category",
    tags: "Tags",
    tagsHelp: "Type a tag and press Enter. Tags help search and show related news.",
    tagPlaceholder: "Ex: Derby, Kentucky, Black Type",
    region: "Region",
    mainImage: "Main image",
    uploadMainImage: "Upload main image",
    changeImage: "Change image",
    title: "Title",
    summary: "Summary",
    content: "Content",
    editor: "Editor",
    livePreview: "Preview",
    bold: "Bold",
    italic: "Italic",
    h2: "Title",
    h3: "Subtitle",
    quote: "Quote",
    list: "List",
    link: "Link",
    image: "Image",
    video: "Video",
    horseMention: "Mention horse",
    visibleText: "Visible text",
    url: "URL",
    youtubeUrl: "YouTube link",
    horseName: "Horse name",
    horseSlug: "Slug / Bloodstock page",
    horsePedigree: "Short pedigree",
    goToHorse: "Go to Bloodstock page",
    deleteTitle: "Delete news",
    deleteText: "Are you sure you want to delete this news item? This action cannot be undone.",
    selectRegion: "Select region",
    regionOptions: [
      { key: "north-america", label: "North America" },
      { key: "south-america", label: "South America" },
      { key: "europe", label: "Europe" },
      { key: "middle-east", label: "Middle East" },
      { key: "asia-oceania", label: "Asia / Oceania" },
    ],
  },
};

const EMPTY_FORM = {
  id: null,
  slug: "",
  category: "",
  tags: [],
  regions: [],
  news_date: new Date().toISOString().slice(0, 10),
  region: "",
  image_url: "",
  status: "draft",
  es_title: "",
  es_summary: "",
  es_content: "",
  pt_title: "",
  pt_summary: "",
  pt_content: "",
  en_title: "",
  en_summary: "",
  en_content: "",
};

function makeSlug(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getExactTranslation(article, language) {
  const translations = article?.translations || article?.lineage_news_translations || [];
  return translations.find((item) => item.language === language) || {};
}

function getBestTranslation(article, language) {
  const translations = article?.translations || article?.lineage_news_translations || [];
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

function getPreviewRegionLabels(article) {
  const rawRegion = String(article?.region || "");

  if (!rawRegion.trim()) return [];

  return [...new Set(
    rawRegion
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean)
  )];
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeYoutubeUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";

  const watchMatch = value.match(/[?&]v=([^&]+)/);
  if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  const shortMatch = value.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  const embedMatch = value.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch?.[1]) return `https://www.youtube.com/embed/${embedMatch[1]}`;

  return value;
}

async function uploadMediaFile(file, folder = "news") {
  if (!file) return "";

  const originalName = file.name || "media";
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${folder}/${Date.now()}-${makeSlug(baseName)}.${extension}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(filePath);
  return data?.publicUrl || "";
}

export default function PanelAdminNoticiasPage() {
  const { language } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;

  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [news, setNews] = useState([]);
  const [section, setSection] = useState("published");
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewArticle, setPreviewArticle] = useState(null);
  const [horseModal, setHorseModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isAdmin = checkIsAdmin(authUser);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user || null;

      if (!isMounted) return;
      setAuthUser(user);

      if (checkIsAdmin(user)) {
        await loadNews();
      }

      if (isMounted) setLoading(false);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadNews() {
    const { data, error } = await supabase
      .from("lineage_news")
      .select(
        `
        *,
        translations:lineage_news_translations(*)
      `
      )
      .order("created_at", { ascending: false });

    if (!error) setNews(data || []);
    else setNews([]);
  }

  const publishedNews = useMemo(
    () => news.filter((item) => item.status === "published"),
    [news]
  );

  const draftNews = useMemo(
    () => news.filter((item) => item.status !== "published"),
    [news]
  );

  const currentList = section === "published" ? publishedNews : draftNews;

  const existingTags = useMemo(() => {
    const allTags = news.flatMap((item) =>
      Array.isArray(item.tags) ? item.tags : []
    );

    return Array.from(
      new Set(
        allTags
          .map((tag) => String(tag || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [news]);

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "es_title" && !current.id && !current.slug) {
        next.slug = makeSlug(value);
      }
      return next;
    });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setMessage("");
    setSection("create");
  }

  function editArticle(article) {
    const es = getExactTranslation(article, "es");
    const pt = getExactTranslation(article, "pt");
    const en = getExactTranslation(article, "en");

    const parsedRegions = article.region
      ? String(article.region)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    setForm({
      id: article.id,
      slug: article.slug || "",
      category: article.category || "",
      tags: Array.isArray(article.tags) ? article.tags : [],
      regions: parsedRegions,
      news_date: article.published_at
        ? String(article.published_at).slice(0, 10)
        : article.created_at
        ? String(article.created_at).slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      region: article.region || "",
      image_url: article.image_url || "",
      status: article.status || "draft",
      es_title: es.title || "",
      es_summary: es.summary || "",
      es_content: es.content || "",
      pt_title: pt.title || "",
      pt_summary: pt.summary || "",
      pt_content: pt.content || "",
      en_title: en.title || "",
      en_summary: en.summary || "",
      en_content: en.content || "",
    });
    setSection("create");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveArticle(nextStatus) {
    if (saving) return;

    setSaving(true);
    setMessage(t.loading);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const currentUser = userData?.user || authUser;

      if (userError || !currentUser) {
        setMessage(`${t.loginRequired} ${userError?.message || ""}`);
        return;
      }

      if (!checkIsAdmin(currentUser)) {
        setMessage(t.accessDenied);
        return;
      }

      const mainTitle = form.es_title.trim();

      if (!mainTitle) {
        setMessage("Escribí un título antes de guardar o publicar.");
        return;
      }

      const safeSlug = makeSlug(form.slug || mainTitle);

      if (!safeSlug) {
        setMessage("Revisá el título de la noticia.");
        return;
      }

      const selectedRegions = Array.isArray(form.regions) ? form.regions : [];
      const joinedRegions = selectedRegions.join(", ");
      const selectedDateIso = form.news_date
        ? new Date(`${form.news_date}T12:00:00`).toISOString()
        : new Date().toISOString();

      const newsPayload = {
        slug: safeSlug,
        category: null,
        tags: Array.isArray(form.tags) ? form.tags : [],
        region: joinedRegions || null,
        image_url: form.image_url || null,
        status: nextStatus,
        published_at: selectedDateIso,
        updated_at: new Date().toISOString(),
      };

      let newsId = form.id;

      if (form.id) {
        const { data, error } = await supabase
          .from("lineage_news")
          .update(newsPayload)
          .eq("id", form.id)
          .select("id")
          .single();

        if (error) {
          console.error("Error updating lineage_news:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          setMessage(
            `No se pudo guardar la noticia: ${
              error.message || error.details || error.hint || error.code || t.error
            }`
          );
          return;
        }

        newsId = data?.id || form.id;
      } else {
        const insertPayload = {
          ...newsPayload,
          created_by: currentUser.id || null,
          created_by_email: currentUser.email || null,
        };

        const { data, error } = await supabase
          .from("lineage_news")
          .upsert(insertPayload, { onConflict: "slug" })
          .select("id")
          .single();

        if (error) {
          console.error("Error saving lineage_news:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            payload: insertPayload,
          });
          setMessage(
            `No se pudo crear/publicar la noticia: ${
              error.message || error.details || error.hint || error.code || t.error
            }`
          );
          return;
        }

        newsId = data?.id;

        setForm((current) => ({
          ...current,
          id: newsId,
          slug: safeSlug,
          status: nextStatus,
        }));
      }

      if (!newsId) {
        setMessage("No se pudo obtener el ID de la noticia guardada.");
        return;
      }

      const finalEsTitle = form.es_title.trim() || mainTitle;
      const finalPtTitle = form.pt_title.trim() || finalEsTitle;
      const finalEnTitle = form.en_title.trim() || finalEsTitle;

      const finalEsContent = form.es_content || null;
      const finalPtContent = form.pt_content || form.es_content || null;
      const finalEnContent = form.en_content || form.es_content || null;

      const translations = [
        {
          news_id: newsId,
          language: "es",
          title: finalEsTitle,
          summary: null,
          content: finalEsContent,
        },
        {
          news_id: newsId,
          language: "pt",
          title: finalPtTitle,
          summary: null,
          content: finalPtContent,
        },
        {
          news_id: newsId,
          language: "en",
          title: finalEnTitle,
          summary: null,
          content: finalEnContent,
        },
      ];

      const { error: deleteTranslationsError } = await supabase
        .from("lineage_news_translations")
        .delete()
        .eq("news_id", newsId);

      if (deleteTranslationsError) {
        console.error("Error deleting previous translations:", {
          message: deleteTranslationsError.message,
          details: deleteTranslationsError.details,
          hint: deleteTranslationsError.hint,
          code: deleteTranslationsError.code,
        });
        setMessage(
          `La noticia se guardó, pero falló la actualización de traducciones: ${
            deleteTranslationsError.message ||
            deleteTranslationsError.details ||
            deleteTranslationsError.hint ||
            deleteTranslationsError.code ||
            t.error
          }`
        );
        return;
      }

      const { error: insertTranslationsError } = await supabase
        .from("lineage_news_translations")
        .insert(translations);

      if (insertTranslationsError) {
        console.error("Error inserting lineage_news_translations:", {
          message: insertTranslationsError.message,
          details: insertTranslationsError.details,
          hint: insertTranslationsError.hint,
          code: insertTranslationsError.code,
        });
        setMessage(
          `La noticia se guardó, pero fallaron las traducciones: ${
            insertTranslationsError.message ||
            insertTranslationsError.details ||
            insertTranslationsError.hint ||
            insertTranslationsError.code ||
            t.error
          }`
        );
        return;
      }

      await loadNews();

      setForm((current) => ({
        ...current,
        id: newsId,
        slug: safeSlug,
        status: nextStatus,
        region: joinedRegions,
        es_title: finalEsTitle,
        pt_title: finalPtTitle,
        en_title: finalEnTitle,
        pt_content: finalPtContent || "",
        en_content: finalEnContent || "",
      }));

      setSection(nextStatus === "published" ? "published" : "draft");
      setMessage(
        nextStatus === "published"
          ? "Noticia publicada en Supabase."
          : "Noticia guardada como borrador en Supabase."
      );
    } catch (error) {
      console.error("Unexpected saveArticle error:", error);
      setMessage(`Error inesperado al guardar: ${error?.message || String(error)}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteArticle(articleId) {
    const { error } = await supabase.from("lineage_news").delete().eq("id", articleId);

    if (error) {
      setMessage(t.error);
      return;
    }

    if (form.id === articleId) setForm(EMPTY_FORM);
    await loadNews();
    setDeleteTarget(null);
    setMessage(t.deleted);
  }

  function openArticlePreview(article) {
    setPreviewArticle(article);
  }

  function previewCurrentForm() {
    setPreviewArticle({
      id: form.id || "current-preview",
      slug: form.slug || makeSlug(form.es_title) || "preview",
      category: null,
      tags: Array.isArray(form.tags) ? form.tags : [],
      region: Array.isArray(form.regions) ? form.regions.join(", ") : "",
      image_url: form.image_url,
      status: form.status,
      created_at: form.news_date
        ? new Date(`${form.news_date}T12:00:00`).toISOString()
        : new Date().toISOString(),
      published_at: form.news_date
        ? new Date(`${form.news_date}T12:00:00`).toISOString()
        : null,
      translations: [
        { language: "es", title: form.es_title, summary: "", content: form.es_content },
        { language: "pt", title: form.pt_title || form.es_title, summary: "", content: form.pt_content || form.es_content },
        { language: "en", title: form.en_title || form.es_title, summary: "", content: form.en_content || form.es_content },
      ],
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f1e6] px-5 py-10 text-[#1b0909]">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">{t.loading}</p>
      </main>
    );
  }

  if (!authUser) return <AccessMessage title={t.loginRequired} t={t} showLogin />;
  if (!isAdmin) return <AccessMessage title={t.accessDenied} t={t} />;

  return (
    <main className="min-h-screen bg-[#f7f1e6] text-[#1b0909]">
      <section className="border-b border-[#8b0d0d] bg-[#8b0d0d] px-5 py-9 text-white">
        <div className="mx-auto max-w-7xl">
          <Link href="/paneladmin" className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
            ← {t.back}
          </Link>
          <h1 className="article-title mt-4 text-4xl text-white md:text-6xl">{t.adminTitle}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/75">{t.adminSubtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6 flex flex-wrap gap-2 border-b-2 border-[#8b0d0d] pb-5">
          <AdminTab active={section === "published"} onClick={() => setSection("published")}>
            {t.publishedNews} ({publishedNews.length})
          </AdminTab>
          <AdminTab active={section === "draft"} onClick={() => setSection("draft")}>
            {t.draftNews} ({draftNews.length})
          </AdminTab>
          <AdminTab active={section === "create"} onClick={resetForm} primary>
            + {t.createNews}
          </AdminTab>
        </div>

        {message ? (
          <p className="mb-6 border border-[#8b0d0d] bg-[#fbf6ec] px-4 py-3 text-sm font-semibold text-[#8b0d0d]">
            {message}
          </p>
        ) : null}

        {section === "create" ? (
          <NewsEditor
            t={t}
            form={form}
            updateField={updateField}
            saveArticle={saveArticle}
            saving={saving}
            previewCurrentForm={previewCurrentForm}
            setHorseModal={setHorseModal}
            setMessage={setMessage}
            existingTags={existingTags}
          />
        ) : (
          <NewsList
            t={t}
            language={language}
            items={currentList}
            empty={t.noItems}
            onPreview={openArticlePreview}
            onEdit={editArticle}
            onDelete={(article) => setDeleteTarget(article)}
          />
        )}
      </section>

      {previewArticle ? (
        <ArticlePreviewModal
          article={previewArticle}
          language={language}
          t={t}
          onClose={() => setPreviewArticle(null)}
          onHorseClick={setHorseModal}
        />
      ) : null}

      {horseModal ? (
        <HorseModal horse={horseModal} t={t} onClose={() => setHorseModal(null)} />
      ) : null}

      {deleteTarget ? (
        <ConfirmModal
          title={t.deleteTitle}
          text={t.deleteText}
          t={t}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteArticle(deleteTarget.id)}
        />
      ) : null}
    </main>
  );
}

function AccessMessage({ title, t, showLogin = false }) {
  return (
    <main className="min-h-screen bg-[#f7f1e6] px-5 py-10 text-[#1b0909]">
      <div className="mx-auto max-w-3xl border-2 border-[#8b0d0d] bg-[#fbf6ec] p-7">
        <h1 className="article-title text-3xl text-[#8b0d0d]">{title}</h1>
        <Link
          href={showLogin ? "/acceso-lineage" : "/paneladmin"}
          className="mt-6 inline-flex border border-[#8b0d0d] bg-[#8b0d0d] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white"
        >
          {showLogin ? "Ingresar" : t.back}
        </Link>
      </div>
    </main>
  );
}

function AdminTab({ active, children, onClick, primary = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active || primary
          ? "border border-[#8b0d0d] bg-[#8b0d0d] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"
          : "border border-[#8b0d0d] bg-[#fbf6ec] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d] hover:bg-[#8b0d0d] hover:text-white"
      }
    >
      {children}
    </button>
  );
}

function NewsList({ t, language, items, empty, onPreview, onEdit, onDelete }) {
  if (!items.length) {
    return (
      <p className="border border-[#8b0d0d] bg-[#fbf6ec] p-5 text-sm font-semibold text-[#8b0d0d]">
        {empty}
      </p>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((article) => {
        const translation = getBestTranslation(article, language);
        const date = formatDate(article.published_at || article.created_at, language);

        return (
          <article key={article.id} className="border-2 border-[#8b0d0d] bg-[#fbf6ec] p-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
              {article.status === "published" ? t.published : t.draft}
              {date ? ` · ${date}` : ""}
            </p>
            <h2 className="article-title min-h-[72px] text-2xl text-[#1b0909]">
              {translation.title || article.slug}
            </h2>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
              {[article.region, article.category].filter(Boolean).join(" · ") || "News"}
            </p>
            {Array.isArray(article.tags) && article.tags.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {article.tags.slice(0, 5).map((tag) => (
                  <span key={tag} className="border border-[#8b0d0d] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d]">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            {translation.summary ? (
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#4f342c]">{translation.summary}</p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-[#c9b89d] pt-4">
              <button type="button" onClick={() => onPreview(article)} className="admin-small-button">
                {t.preview}
              </button>
              <button type="button" onClick={() => onEdit(article)} className="admin-small-button">
                {t.edit}
              </button>
              <button type="button" onClick={() => onDelete(article)} className="admin-small-button-danger">
                {t.delete}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function NewsEditor({
  t,
  form,
  updateField,
  saveArticle,
  saving,
  previewCurrentForm,
  setHorseModal,
  setMessage,
  existingTags = [],
}) {
  const [showTranslations, setShowTranslations] = useState(false);
  const [activeTranslation, setActiveTranslation] = useState("pt");

  const translationTitleField = `${activeTranslation}_title`;
  const translationContentField = `${activeTranslation}_content`;
  const translationLabel = activeTranslation === "pt" ? "Portugués" : "Inglés";

  const currentPreviewArticle = {
    id: "live-preview",
    slug: form.slug || makeSlug(form.es_title) || "preview",
    category: null,
    tags: Array.isArray(form.tags) ? form.tags : [],
    region: Array.isArray(form.regions) ? form.regions.join(", ") : "",
    image_url: form.image_url,
    status: form.status,
    created_at: form.news_date
      ? new Date(`${form.news_date}T12:00:00`).toISOString()
      : new Date().toISOString(),
    published_at: form.news_date
      ? new Date(`${form.news_date}T12:00:00`).toISOString()
      : null,
    translations: [
      { language: "es", title: form.es_title, summary: "", content: form.es_content },
      { language: "pt", title: form.es_title, summary: "", content: form.es_content },
      { language: "en", title: form.es_title, summary: "", content: form.es_content },
    ],
  };

  return (
    <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="border-2 border-[#8b0d0d] bg-[#fbf6ec] p-5 md:p-7">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#c9b89d] pb-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b0d0d]">
              {form.id ? t.editNews : t.createNews}
            </p>
            <h2 className="article-title mt-2 text-3xl text-[#1b0909]">
              {t.editor}
            </h2>
          </div>
        </div>

        <div className="grid gap-4">
          <InputField
            label={t.title}
            value={form.es_title}
            onChange={(value) => updateField("es_title", value)}
          />

          <TagsInput
            label={t.tags}
            help={t.tagsHelp}
            placeholder={t.tagPlaceholder}
            value={form.tags}
            suggestions={existingTags}
            onChange={(value) => updateField("tags", value)}
          />

          <RegionsMultiSelect
            label={t.region}
            value={form.regions}
            onChange={(value) => updateField("regions", value)}
            options={t.regionOptions}
          />

          <DateField
            label="Fecha"
            value={form.news_date}
            onChange={(value) => updateField("news_date", value)}
          />
        </div>

        <div className="mt-6 grid gap-4">
          <RichEditor
            label={`${t.content} original`}
            value={form.es_content}
            onChange={(value) => updateField("es_content", value)}
            t={t}
            setMessage={setMessage}
          />

          <div className="border border-[#8b0d0d] bg-white">
            <button
              type="button"
              onClick={() => setShowTranslations((current) => !current)}
              className="flex w-full items-center justify-between bg-[#fbf6ec] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]"
            >
              <span>Editar traducciones</span>
              <span>{showTranslations ? "Cerrar" : "Abrir"}</span>
            </button>

            {showTranslations ? (
              <div className="grid gap-4 border-t border-[#8b0d0d] p-4">
                <p className="text-sm leading-6 text-[#4f342c]">
                  La noticia se publica como texto HTML editable. Podés dejar estas traducciones vacías y se usará el español, o editarlas para que el cambio de idioma muestre contenido diferente.
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTranslation("pt")}
                    className={
                      activeTranslation === "pt"
                        ? "border border-[#8b0d0d] bg-[#8b0d0d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                        : "border border-[#8b0d0d] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]"
                    }
                  >
                    Portugués
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTranslation("en")}
                    className={
                      activeTranslation === "en"
                        ? "border border-[#8b0d0d] bg-[#8b0d0d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                        : "border border-[#8b0d0d] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]"
                    }
                  >
                    Inglés
                  </button>
                </div>

                <InputField
                  label={`Título ${translationLabel}`}
                  value={form[translationTitleField]}
                  onChange={(value) => updateField(translationTitleField, value)}
                />

                <RichEditor
                  label={`Contenido ${translationLabel}`}
                  value={form[translationContentField]}
                  onChange={(value) => updateField(translationContentField, value)}
                  t={t}
                  setMessage={setMessage}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3 border-t border-[#c9b89d] pt-5">
          <button
            type="button"
            disabled={saving}
            onClick={() => saveArticle("draft")}
            className="border border-[#8b0d0d] bg-[#fbf6ec] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b0d0d] disabled:opacity-50"
          >
            {saving ? t.loading : t.saveDraft}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => saveArticle("published")}
            className="border border-[#8b0d0d] bg-[#8b0d0d] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-50"
          >
            {saving ? t.loading : t.publish}
          </button>

          <button
            type="button"
            onClick={previewCurrentForm}
            className="border border-[#8b0d0d] bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]"
          >
            {t.preview}
          </button>
        </div>
      </section>

      <section className="border-2 border-[#8b0d0d] bg-[#fbf6ec] p-5 md:p-7">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b0d0d]">
          {t.livePreview}
        </p>

        <ArticlePreviewContent
          article={currentPreviewArticle}
          language="es"
          t={t}
          onHorseClick={setHorseModal}
          compact
        />
      </section>
    </div>
  );
}
function RichEditor({ label, value, onChange, t, setMessage }) {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const dragHtmlRef = useRef("");
  const savedRangeRef = useRef(null);

  const [modal, setModal] = useState(null);
  const [modalValues, setModalValues] = useState({
    url: "",
    text: "",
    videoUrl: "",
    horseName: "",
    horseSlug: "",
    horsePedigree: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fontSize, setFontSize] = useState("16");
  const [textColor, setTextColor] = useState("#000000");
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [showTableTools, setShowTableTools] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  function saveEditorSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection?.();

    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function restoreEditorSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection?.();

    if (!editor || !selection || !savedRangeRef.current) {
      editor?.focus();
      return;
    }

    editor.focus();
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  }

  function syncEditor() {
    saveEditorSelection();
    onChange(editorRef.current?.innerHTML || "");
  }

  function runCommand(command, arg = null) {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    syncEditor();
  }

  function insertHtml(html, shouldCloseModal = true) {
    restoreEditorSelection();
    document.execCommand("insertHTML", false, html);
    savedRangeRef.current = null;
    syncEditor();
    if (shouldCloseModal) setModal(null);
  }

  function openModal(type) {
    saveEditorSelection();
    setModalValues({
      url: "",
      text: "",
      videoUrl: "",
      horseName: "",
      horseSlug: "",
      horsePedigree: "",
    });
    setModal(type);
  }

  function wrapSelectionWithStyle(style) {
    editorRef.current?.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      const styleText = Object.entries(style)
        .map(([key, value]) => `${key}:${value}`)
        .join(";");
      document.execCommand("insertHTML", false, `<span style="${styleText}">&nbsp;</span>`);
      syncEditor();
      return;
    }

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");

    Object.entries(style).forEach(([key, value]) => {
      span.style[key] = value;
    });

    try {
      range.surroundContents(span);
    } catch {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }

    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);

    syncEditor();
  }

  function applyFontSize(value) {
    setFontSize(value);
    wrapSelectionWithStyle({ fontSize: `${value}px` });
  }

  function applyTextColor(value) {
    setTextColor(value);
    runCommand("foreColor", value);
  }

  function submitLink() {
    if (!modalValues.url.trim()) return;
    const label = modalValues.text.trim() || modalValues.url.trim();

    insertHtml(
      `<a href="${escapeHtml(
        modalValues.url.trim()
      )}" target="_blank" rel="noopener noreferrer" style="color:#8b0d0d;text-decoration:underline;">${escapeHtml(
        label
      )}</a>`
    );
  }

  function submitVideo() {
    if (!modalValues.videoUrl.trim()) return;
    const embedUrl = normalizeYoutubeUrl(modalValues.videoUrl);
    const videoId = `video-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    insertHtml(`
      <span
        class="lineage-resizable-media lineage-resizable-video"
        data-media-id="${videoId}"
        contenteditable="false"
        draggable="true"
        style="display:block;width:75%;min-width:220px;max-width:100%;margin:22px auto 22px 0;border:1px solid #8b0d0d;cursor:move;resize:horizontal;overflow:auto;background:#1b0909;"
      >
        <span class="lineage-video-ratio" style="display:block;position:relative;width:100%;padding-top:56.25%;background:#1b0909;">
          <iframe
            src="${escapeHtml(embedUrl)}"
            title="YouTube video"
            style="position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </span>
      </span><p><br></p>
    `);
  }

  function submitHorseMention() {
    if (!modalValues.horseName.trim()) return;

    const name = modalValues.horseName.trim();
    const slug = modalValues.horseSlug.trim() || makeSlug(name);
    const pedigree = modalValues.horsePedigree.trim();

    insertHtml(`
      <button
        type="button"
        class="lineage-horse-mention"
        data-horse-name="${escapeHtml(name)}"
        data-horse-slug="${escapeHtml(slug)}"
        data-pedigree="${escapeHtml(pedigree)}"
        style="display:inline;border:0;background:transparent;color:#8b0d0d;text-decoration:underline;font:inherit;cursor:pointer;padding:0;"
      >
        <strong>${escapeHtml(name)}</strong>
      </button>&nbsp;
    `);
  }

  async function uploadEditorImage(file) {
    if (!file) return;

    try {
      setUploadingImage(true);
      setMessage("");
      const publicUrl = await uploadMediaFile(file, "editor");

      if (publicUrl) {
        const imageId = `img-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        insertHtml(
          `<span
            class="lineage-resizable-media lineage-resizable-image"
            data-media-id="${imageId}"
            contenteditable="false"
            draggable="true"
            style="display:block;width:55%;min-width:160px;max-width:100%;margin:18px auto 18px 0;border:1px solid #c9b89d;cursor:move;resize:horizontal;overflow:auto;background:#fbf6ec;"
          >
            <img src="${escapeHtml(
              publicUrl
            )}" alt="" draggable="false" style="display:block;width:100%;height:auto;pointer-events:none;" />
          </span><p><br></p>`,
          true
        );
      }
    } catch {
      setMessage(t.uploadError);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  function createTableHtml(rows = 2, columns = 2) {
    const tableId = `table-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const safeRows = Math.max(1, Number(rows) || 2);
    const safeColumns = Math.max(1, Number(columns) || 2);

    const bodyRows = Array.from({ length: safeRows })
      .map(() => {
        const cells = Array.from({ length: safeColumns })
          .map(
            () =>
              `<td style="border:1px solid #8b0d0d;padding:10px;min-width:90px;vertical-align:top;"><br></td>`
          )
          .join("");

        return `<tr>${cells}</tr>`;
      })
      .join("");

    return `
      <table
        class="lineage-editor-table"
        data-table-id="${tableId}"
        style="width:100%;border-collapse:collapse;margin:20px 0;border:1px solid #8b0d0d;background:#ffffff;color:#1b0909;"
      >
        <tbody>${bodyRows}</tbody>
      </table><p><br></p>
    `;
  }

  function insertTable(rows = 2, columns = 2) {
    insertHtml(createTableHtml(rows, columns), false);
    setShowTableTools(true);
  }

  function getCurrentTableCell() {
    const editor = editorRef.current;
    const selection = window.getSelection?.();

    if (!editor) return null;

    if (selection && selection.rangeCount > 0) {
      let node = selection.anchorNode;

      if (node?.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }

      const selectedCell = node?.closest?.("td, th");

      if (selectedCell && editor.contains(selectedCell)) {
        return selectedCell;
      }
    }

    return editor.querySelector("td, th");
  }

  function getCurrentTable() {
    const cell = getCurrentTableCell();
    return cell?.closest?.("table") || editorRef.current?.querySelector("table");
  }

  function focusCell(cell) {
    if (!cell) return;

    const selection = window.getSelection?.();
    const range = document.createRange();

    cell.focus?.();
    range.selectNodeContents(cell);
    range.collapse(false);

    selection?.removeAllRanges();
    selection?.addRange(range);
    savedRangeRef.current = range.cloneRange();
  }

  function addTableRow() {
    const table = getCurrentTable();
    const cell = getCurrentTableCell();

    if (!table || !cell) {
      insertTable(2, 2);
      return;
    }

    const currentRow = cell.closest("tr");
    const columnCount = currentRow?.children?.length || table.rows?.[0]?.children?.length || 2;
    const newRow = document.createElement("tr");

    Array.from({ length: columnCount }).forEach(() => {
      const newCell = document.createElement("td");
      newCell.setAttribute(
        "style",
        "border:1px solid #8b0d0d;padding:10px;min-width:90px;vertical-align:top;"
      );
      newCell.innerHTML = "<br>";
      newRow.appendChild(newCell);
    });

    currentRow.after(newRow);
    focusCell(newRow.querySelector("td, th"));
    syncEditor();
  }

  function addTableColumn() {
    const table = getCurrentTable();
    const cell = getCurrentTableCell();

    if (!table || !cell) {
      insertTable(2, 2);
      return;
    }

    const index = Array.from(cell.parentElement.children).indexOf(cell);

    Array.from(table.rows).forEach((row) => {
      const newCell = document.createElement("td");
      newCell.setAttribute(
        "style",
        "border:1px solid #8b0d0d;padding:10px;min-width:90px;vertical-align:top;"
      );
      newCell.innerHTML = "<br>";

      const referenceCell = row.children[index];
      if (referenceCell?.nextSibling) {
        row.insertBefore(newCell, referenceCell.nextSibling);
      } else {
        row.appendChild(newCell);
      }
    });

    focusCell(cell.parentElement.children[index + 1] || cell);
    syncEditor();
  }

  function deleteTableRow() {
    const table = getCurrentTable();
    const cell = getCurrentTableCell();
    const row = cell?.closest?.("tr");

    if (!table || !row) return;

    if (table.rows.length <= 1) {
      table.remove();
      syncEditor();
      return;
    }

    const nextFocus = row.nextElementSibling?.querySelector("td, th") || row.previousElementSibling?.querySelector("td, th");
    row.remove();
    focusCell(nextFocus);
    syncEditor();
  }

  function deleteTableColumn() {
    const table = getCurrentTable();
    const cell = getCurrentTableCell();

    if (!table || !cell) return;

    const index = Array.from(cell.parentElement.children).indexOf(cell);
    const firstRow = table.rows?.[0];
    const columnCount = firstRow?.children?.length || 0;

    if (columnCount <= 1) {
      table.remove();
      syncEditor();
      return;
    }

    Array.from(table.rows).forEach((row) => {
      row.children[index]?.remove();
    });

    const nextFocus = table.rows?.[0]?.children?.[Math.max(0, index - 1)] || table.querySelector("td, th");
    focusCell(nextFocus);
    syncEditor();
  }

  function deleteTable() {
    const table = getCurrentTable();
    if (!table) return;

    table.remove();
    syncEditor();
  }

  function handlePaste(event) {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (!imageItem) return;

    event.preventDefault();
    const file = imageItem.getAsFile();
    if (file) uploadEditorImage(file);
  }

  function clearImageSelection() {
    editorRef.current
      ?.querySelectorAll(".lineage-resizable-media")
      .forEach((item) => {
        item.classList.remove("is-selected");
        item.style.outline = "";
        item.style.outlineOffset = "";
      });
  }

  function handleEditorClick(event) {
    const imageBlock = event.target.closest?.(".lineage-resizable-media");

    clearImageSelection();

    if (!imageBlock) {
      setSelectedImageId(null);
      return;
    }

    const id =
      imageBlock.dataset.mediaId ||
      `img-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    imageBlock.dataset.mediaId = id;
    imageBlock.classList.add("is-selected");
    imageBlock.style.outline = "2px solid #8b0d0d";
    imageBlock.style.outlineOffset = "3px";
    setSelectedImageId(id);
  }

  function getSelectedImageBlock() {
    if (!selectedImageId) return null;
    return editorRef.current?.querySelector(
      `.lineage-resizable-media[data-media-id="${selectedImageId}"]`
    );
  }

  function setSelectedImageWidth(width) {
    const imageBlock = getSelectedImageBlock();
    if (!imageBlock) return;

    imageBlock.style.width = width;
    imageBlock.style.minWidth = "120px";
    imageBlock.style.maxWidth = "100%";
    syncEditor();
  }

  function alignSelectedImage(position) {
    const imageBlock = getSelectedImageBlock();
    if (!imageBlock) return;

    imageBlock.style.display = "block";

    if (position === "left") {
      imageBlock.style.margin = "18px auto 18px 0";
    }

    if (position === "center") {
      imageBlock.style.margin = "18px auto";
    }

    if (position === "right") {
      imageBlock.style.margin = "18px 0 18px auto";
    }

    syncEditor();
  }

  function deleteSelectedImage() {
    const imageBlock = getSelectedImageBlock();
    if (!imageBlock) return;

    imageBlock.remove();
    setSelectedImageId(null);
    syncEditor();
  }

  function handleDragStart(event) {
    const imageBlock = event.target.closest?.(".lineage-resizable-media");
    if (!imageBlock) return;

    dragHtmlRef.current = imageBlock.outerHTML;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/html", imageBlock.outerHTML);
    setTimeout(() => imageBlock.remove(), 0);
  }

  function handleDrop(event) {
    if (!dragHtmlRef.current) return;

    event.preventDefault();
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, dragHtmlRef.current);
    dragHtmlRef.current = "";
    syncEditor();
  }

  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
        {label}
      </span>

      <div className="border border-[#8b0d0d] border-b-0 bg-[#f7f1e6] p-2">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#c9b89d] pb-2">
          <select
            value={fontSize}
            onChange={(event) => applyFontSize(event.target.value)}
            className="h-9 border border-[#8b0d0d] bg-white px-2 text-xs font-semibold tracking-[0.08em] text-black outline-none"
            title="Tamaño texto"
          >
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="14">14</option>
            <option value="16">16</option>
            <option value="18">18</option>
            <option value="20">20</option>
            <option value="24">24</option>
            <option value="28">28</option>
            <option value="32">32</option>
            <option value="36">36</option>
            <option value="42">42</option>
            <option value="48">48</option>
          </select>

          <ToolbarButton label="Negrita" onClick={() => runCommand("bold")}>B</ToolbarButton>
          <ToolbarButton label="Itálica" onClick={() => runCommand("italic")} italic>I</ToolbarButton>
          <ToolbarButton label="Subrayado" onClick={() => runCommand("underline")} underline>U</ToolbarButton>

          <label
            className="flex h-9 items-center gap-2 border border-[#8b0d0d] bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d]"
            title="Color de texto"
          >
            Color
            <input
              type="color"
              value={textColor}
              onChange={(event) => applyTextColor(event.target.value)}
              className="h-5 w-7 cursor-pointer border-0 bg-transparent p-0"
            />
          </label>

          <ToolbarButton label="Alinear izquierda" onClick={() => runCommand("justifyLeft")}>↤</ToolbarButton>
          <ToolbarButton label="Centrar" onClick={() => runCommand("justifyCenter")}>↔</ToolbarButton>
          <ToolbarButton label="Alinear derecha" onClick={() => runCommand("justifyRight")}>↦</ToolbarButton>
          <ToolbarButton label="Justificar" onClick={() => runCommand("justifyFull")}>☰</ToolbarButton>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ToolbarButton label="Cita" onClick={() => runCommand("formatBlock", "blockquote")}>“”</ToolbarButton>
          <ToolbarButton label="Link" onClick={() => openModal("link")}>🔗</ToolbarButton>

          <ToolbarButton label="Imagen" onClick={() => imageInputRef.current?.click()}>
            {uploadingImage ? "..." : "▧"}
          </ToolbarButton>

          <ToolbarButton label="Video YouTube" onClick={() => openModal("video")}>▶</ToolbarButton>
          <ToolbarTextButton onClick={() => openModal("horse")}>{t.horseMention}</ToolbarTextButton>
          <ToolbarTextButton onClick={() => setShowTableTools((current) => !current)}>Tabla</ToolbarTextButton>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => uploadEditorImage(event.target.files?.[0])}
          />
        </div>

        {showTableTools ? (
          <div className="mt-2 border-t border-[#c9b89d] pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
                Tabla
              </span>
              <ToolbarTextButton onClick={() => insertTable(2, 2)}>Insertar 2x2</ToolbarTextButton>
              <ToolbarTextButton onClick={addTableRow}>+ Fila</ToolbarTextButton>
              <ToolbarTextButton onClick={addTableColumn}>+ Columna</ToolbarTextButton>
              <ToolbarTextButton onClick={deleteTableRow}>Borrar fila</ToolbarTextButton>
              <ToolbarTextButton onClick={deleteTableColumn}>Borrar columna</ToolbarTextButton>
              <ToolbarTextButton onClick={deleteTable}>Borrar tabla</ToolbarTextButton>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#8b0d0d]">
              Insertá una tabla y hacé click dentro de una celda para agregar o borrar filas y columnas.
            </p>
          </div>
        ) : null}
      </div>

      {selectedImageId ? (
        <div className="border-x border-b border-[#8b0d0d] bg-[#8b0d0d] px-3 py-2 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
              Elemento seleccionado
            </span>
            <ImageToolbarButton onClick={() => setSelectedImageWidth("25%")} >25%</ImageToolbarButton>
            <ImageToolbarButton onClick={() => setSelectedImageWidth("50%")} >50%</ImageToolbarButton>
            <ImageToolbarButton onClick={() => setSelectedImageWidth("75%")} >75%</ImageToolbarButton>
            <ImageToolbarButton onClick={() => setSelectedImageWidth("100%")} >100%</ImageToolbarButton>
            <ImageToolbarButton onClick={() => alignSelectedImage("left")} >Izq.</ImageToolbarButton>
            <ImageToolbarButton onClick={() => alignSelectedImage("center")} >Centro</ImageToolbarButton>
            <ImageToolbarButton onClick={() => alignSelectedImage("right")} >Der.</ImageToolbarButton>
            <ImageToolbarButton onClick={deleteSelectedImage}>Eliminar</ImageToolbarButton>
          </div>
        </div>
      ) : (
        <div className="border-x border-b border-[#8b0d0d] bg-[#fbf6ec] px-3 py-2">
          <p className="text-xs leading-5 text-[#8b0d0d]">
            Tocá una imagen o video para seleccionarlo. Arriba se abre la barra para agrandar, achicar, alinear o eliminar.
          </p>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncEditor}
        onPaste={handlePaste}
        onMouseUp={saveEditorSelection}
        onKeyUp={saveEditorSelection}
        onClick={handleEditorClick}
        onDragStart={handleDragStart}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="lineage-rich-editor h-[560px] max-h-[65vh] w-full overflow-y-auto border border-[#8b0d0d] bg-white px-4 py-4 text-base leading-8 text-black outline-none"
      />

      {modal ? (
        <LineageEditorModal
          type={modal}
          t={t}
          values={modalValues}
          setValues={setModalValues}
          onClose={() => setModal(null)}
          onSubmit={modal === "link" ? submitLink : modal === "video" ? submitVideo : submitHorseMention}
        />
      ) : null}
    </div>
  );
}

function ImageToolbarButton({ children, onClick }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="border border-white bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] hover:bg-[#f7f1e6]"
    >
      {children}
    </button>
  );
}

function ToolbarButton({ children, onClick, label, italic = false, underline = false }) {
  return (
    <button
      type="button"
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex h-9 min-w-9 items-center justify-center border border-[#8b0d0d] bg-white px-3 text-sm font-bold text-[#8b0d0d] hover:bg-[#8b0d0d] hover:text-white ${
        italic ? "italic" : ""
      } ${underline ? "underline" : ""}`}
    >
      {children}
    </button>
  );
}

function ToolbarTextButton({ children, onClick }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="h-9 border border-[#8b0d0d] bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] hover:bg-[#8b0d0d] hover:text-white"
    >
      {children}
    </button>
  );
}

function LineageEditorModal({ type, t, values, setValues, onClose, onSubmit }) {
  const title = type === "link" ? t.link : type === "video" ? t.video : t.horseMention;

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-xl border-2 border-[#8b0d0d] bg-[#fbf6ec]">
        <div className="flex items-center justify-between border-b-2 border-[#8b0d0d] bg-[#8b0d0d] px-5 py-4 text-white">
          <h3 className="article-title text-2xl text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
            {t.close}
          </button>
        </div>

        <div className="grid gap-4 p-5">
          {type === "link" ? (
            <>
              <LineageModalInput label={t.visibleText} value={values.text} onChange={(value) => update("text", value)} />
              <LineageModalInput label={t.url} value={values.url} onChange={(value) => update("url", value)} placeholder="https://..." />
            </>
          ) : null}

          {type === "video" ? (
            <LineageModalInput label={t.youtubeUrl} value={values.videoUrl} onChange={(value) => update("videoUrl", value)} placeholder="https://www.youtube.com/watch?v=..." />
          ) : null}

          {type === "horse" ? (
            <>
              <LineageModalInput label={t.horseName} value={values.horseName} onChange={(value) => update("horseName", value)} />
              <LineageModalInput label={t.horseSlug} value={values.horseSlug} onChange={(value) => update("horseSlug", value)} />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">{t.horsePedigree}</span>
                <textarea
                  value={values.horsePedigree}
                  onChange={(event) => update("horsePedigree", event.target.value)}
                  rows={4}
                  className="w-full resize-none border border-[#8b0d0d] bg-white px-3 py-3 text-sm text-black outline-none"
                />
              </label>
            </>
          ) : null}

          <div className="mt-2 flex justify-end gap-2 border-t border-[#c9b89d] pt-4">
            <button type="button" onClick={onClose} className="border border-[#8b0d0d] bg-[#fbf6ec] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
              {t.cancel}
            </button>
            <button type="button" onClick={onSubmit} className="border border-[#8b0d0d] bg-[#8b0d0d] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              {t.insert}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LineageModalInput({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-[#8b0d0d] bg-white px-3 py-3 text-sm text-black outline-none placeholder:text-neutral-500"
      />
    </label>
  );
}

function ArticlePreviewModal({ article, language, t, onClose, onHorseClick }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-auto border-2 border-[#8b0d0d] bg-[#fbf6ec]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-[#8b0d0d] bg-[#8b0d0d] px-5 py-4 text-white">
          <h2 className="article-title text-2xl text-white">{t.preview}</h2>
          <button type="button" onClick={onClose} className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
            {t.close}
          </button>
        </div>
        <div className="p-5 md:p-8">
          <ArticlePreviewContent article={article} language={language} t={t} onHorseClick={onHorseClick} />
        </div>
      </div>
    </div>
  );
}

function ArticlePreviewContent({ article, language, t, onHorseClick, compact = false }) {
  const translation = getBestTranslation(article, language);
  const regionLabels = getPreviewRegionLabels(article);

  function handleClick(event) {
    const mention = event.target.closest?.(".lineage-horse-mention");
    if (!mention) return;

    event.preventDefault();
    onHorseClick({
      name: mention.dataset.horseName || mention.textContent || "",
      slug: mention.dataset.horseSlug || "",
      pedigree: mention.dataset.pedigree || "",
    });
  }

  return (
    <article onClick={handleClick} className="bg-[#fbf6ec] text-[#1b0909]">
      {article.image_url ? <img src={article.image_url} alt={translation.title || article.slug} className="mb-6 max-h-[420px] w-full object-cover" /> : null}

      {regionLabels.length ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {regionLabels.map((region) => (
            <span
              key={region}
              className="bg-[#8b0d0d] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white"
            >
              {region}
            </span>
          ))}
        </div>
      ) : null}

      {Array.isArray(article.tags) && article.tags.length ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag} className="border border-[#8b0d0d] bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8b0d0d]">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <h1 className={`article-title text-[#1b0909] ${compact ? "text-3xl" : "text-4xl md:text-6xl"}`}>
        {translation.title || article.slug || t.createNews}
      </h1>

      {translation.summary ? <p className="mt-5 text-lg leading-8 text-[#4f342c]">{translation.summary}</p> : null}

      <div className="lineage-article-content mt-7 border-t border-[#c9b89d] pt-6 text-base leading-8 text-[#1b0909]" dangerouslySetInnerHTML={{ __html: translation.content || "" }} />
    </article>
  );
}

function HorseModal({ horse, t, onClose }) {
  const href = horse.slug ? `/bloodstock/${horse.slug}` : "/bloodstock";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg border-2 border-[#8b0d0d] bg-[#fbf6ec] p-6">
        <div className="flex items-start justify-between gap-4 border-b border-[#c9b89d] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">Bloodstock</p>
            <h2 className="article-title mt-2 text-3xl text-[#1b0909]">{horse.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
            {t.close}
          </button>
        </div>
        {horse.pedigree ? <p className="mt-5 text-base leading-7 text-[#4f342c]">{horse.pedigree}</p> : null}
        <Link href={href} className="mt-6 inline-flex border border-[#8b0d0d] bg-[#8b0d0d] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white">
          {t.goToHorse}
        </Link>
      </div>
    </div>
  );
}

function ConfirmModal({ title, text, t, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg border-2 border-[#8b0d0d] bg-[#fbf6ec]">
        <div className="border-b-2 border-[#8b0d0d] bg-[#8b0d0d] px-5 py-4 text-white">
          <h2 className="article-title text-2xl text-white">{title}</h2>
        </div>
        <div className="p-5">
          <p className="text-sm leading-6 text-[#4f342c]">{text}</p>
          <div className="mt-6 flex justify-end gap-2 border-t border-[#c9b89d] pt-4">
            <button type="button" onClick={onClose} className="border border-[#8b0d0d] bg-[#fbf6ec] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
              {t.cancel}
            </button>
            <button type="button" onClick={onConfirm} className="border border-[#8b0d0d] bg-[#8b0d0d] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              {t.delete}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function TagsInput({ label, help, placeholder, value, suggestions = [], onChange }) {
  const [draft, setDraft] = useState("");
  const tags = Array.isArray(value) ? value : [];
  const availableSuggestions = suggestions.filter(
    (suggestion) =>
      !tags.some((tag) => tag.toLowerCase() === suggestion.toLowerCase())
  );

  function normalizeTag(tag) {
    return String(tag || "").trim().replace(/\s+/g, " ");
  }

  function addTag(rawTag) {
    const nextTag = normalizeTag(rawTag);
    if (!nextTag) return;

    const exists = tags.some(
      (item) => item.toLowerCase() === nextTag.toLowerCase()
    );

    if (!exists) {
      onChange([...tags, nextTag]);
    }

    setDraft("");
  }

  function removeTag(tagToRemove) {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    }

    if (event.key === "Backspace" && !draft && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
        {label}
      </span>

      <div className="min-h-[48px] border border-[#8b0d0d] bg-white px-3 py-2 text-black">
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 border border-[#8b0d0d] bg-[#fbf6ec] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d]"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-[#8b0d0d]"
                aria-label={`Eliminar ${tag}`}
              >
                ×
              </button>
            </span>
          ))}

          <input
            value={draft}
            placeholder={tags.length ? "" : placeholder}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(draft)}
            className="min-w-[180px] flex-1 bg-white px-1 py-2 text-sm text-black outline-none placeholder:text-neutral-500"
          />
        </div>
      </div>

      {availableSuggestions.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {availableSuggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="border border-[#8b0d0d] bg-[#fbf6ec] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] hover:bg-[#8b0d0d] hover:text-white"
            >
              + {tag}
            </button>
          ))}
        </div>
      ) : null}

      {help ? <p className="mt-2 text-xs leading-5 text-[#8b0d0d]">{help}</p> : null}
    </label>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-[#8b0d0d] bg-white px-3 py-3 text-sm text-black outline-none"
      />
    </label>
  );
}

function RegionsMultiSelect({ label, value, onChange, options }) {
  const selected = Array.isArray(value) ? value : [];

  function toggleRegion(regionLabel) {
    const exists = selected.includes(regionLabel);

    if (exists) {
      onChange(selected.filter((item) => item !== regionLabel));
    } else {
      onChange([...selected, regionLabel]);
    }
  }

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
        {label}
      </span>

      <div className="flex flex-wrap gap-2 border border-[#8b0d0d] bg-white px-3 py-3">
        {options.map((item) => {
          const active = selected.includes(item.label);

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleRegion(item.label)}
              className={
                active
                  ? "border border-[#8b0d0d] bg-[#8b0d0d] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
                  : "border border-[#8b0d0d] bg-[#fbf6ec] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b0d0d]"
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </label>
  );
}

function InputField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full border border-[#8b0d0d] bg-white px-3 py-3 text-sm text-black outline-none placeholder:text-neutral-500" />
    </label>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full border border-[#8b0d0d] bg-white px-3 py-3 text-sm text-black outline-none">
        <option value="">{placeholder}</option>
        {options.map((item) => (
          <option key={item.key} value={item.label}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
