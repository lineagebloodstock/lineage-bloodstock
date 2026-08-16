import { NextResponse } from "next/server";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PQ_BASE = "https://www.pedigreequery.com";
const SOURCE = "pedigree_query";
const SOURCE_LABEL = "Pedigree Query";

export async function POST(req) {
  try {
    const body = await safeJson(req);

    const mode = String(body?.mode || "importUrl").trim();
    const horseName = String(body?.horseName || body?.name || "").trim();
    const url = String(body?.url || "").trim();
    const pastedHtml = String(body?.html || "").trim();
    const generations = normalizeGenerations(body?.generations || body?.g || 5);

    if (mode === "suggest" || mode === "search") {
      if (horseName.length < 2) {
        return json({ suggestions: [] });
      }

      const option = buildLocalSuggestion(horseName);

      return json({
        suggestions: option ? [option] : [],
      });
    }

    if (mode === "searchLocalHorse" || mode === "searchLocalHorses") {
      const query = String(body?.query || body?.horseName || body?.name || "").trim();

      if (query.length < 2) {
        return json({ horses: [] });
      }

      return json(await searchLocalHorses(query));
    }

    if (mode === "importHtml") {
      if (!pastedHtml) {
        return json({ error: "Pegá el HTML de Pedigree Query." }, 400);
      }

      const parsed = parsePedigreeQueryHtml(pastedHtml, {
        sourceUrl: url || buildHorseUrl(horseName),
        searchedName: horseName,
        generations,
      });

      return json(parsed);
    }

    if (mode === "importUrl" || mode === "import") {
      if (!url && !horseName) {
        return json({ error: "Ingresá el link del caballo." }, 400);
      }

      const finalUrl = url
        ? normalizePedigreeQueryUrl(url)
        : buildHorseUrl(horseName);

      const html = await fetchPedigreeQueryHtml(finalUrl);

      const parsed = parsePedigreeQueryHtml(html, {
        sourceUrl: finalUrl,
        searchedName: horseName,
        generations,
      });

      const shouldEnrichRelatedPages = body?.enrichRelatedHorsePages !== false;

      if (shouldEnrichRelatedPages) {
        return json(await enrichImportedPedigreeWithHorsePages(parsed));
      }

      return json(parsed);
    }

    if (mode === "saveImportedPedigree") {
      return json(await saveImportedPedigree(body));
    }

    return json({ error: "Modo no reconocido." }, 400);
  } catch (error) {
    return json(
      {
        error: error?.message || "Error importando desde Pedigree Query.",
      },
      500
    );
  }
}

async function safeJson(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function json(payload, status = 200) {
  return NextResponse.json(payload, { status });
}

/* =========================
   FETCH AUTOMÁTICO CON PLAYWRIGHT
========================= */

async function fetchPedigreeQueryHtml(url) {
  const result = await fetchPedigreeQueryHtmlWithPlaywright(url);
  const html = result.html || "";

  if (!html) {
    throw new Error("Pedigree Query no devolvió HTML.");
  }

  if (!html.includes("pedigreetable")) {
    const preview = cleanText(html).slice(0, 420);

    throw new Error(
      `Pedigree Query respondió, pero no llegó la tabla del pedigree. Respuesta: ${preview}`
    );
  }

  return html;
}

async function fetchPedigreeQueryHtmlWithPlaywright(url) {
  let context = null;

  const userDataDir =
    process.env.PEDIGREE_QUERY_PROFILE_DIR ||
    ".playwright-pedigree-query-profile";

  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      timeout: 60000,
      viewport: { width: 1365, height: 900 },
      locale: "es-ES",
      timezoneId: "America/New_York",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
      slowMo: 60,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--no-sandbox",
      ],
      extraHTTPHeaders: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        Referer: "https://www.pedigreequery.com/",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    const cookieText = String(process.env.PEDIGREE_QUERY_COOKIE || "").trim();

    if (cookieText) {
      await context.addCookies(parseCookieHeaderForPlaywright(cookieText));
    }

    const page = context.pages()[0] || (await context.newPage());

    await page.bringToFront().catch(() => {});

    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForTimeout(1200);

    let html = await page.content();

    if (!html.includes("pedigreetable") && isCloudflarePageHtml(html)) {
      await page.bringToFront().catch(() => {});

      // IMPORTANTE:
      // Si Cloudflare pide verificación humana, esta espera te deja la ventana abierta.
      // Completá la verificación en Chromium. Cuando Pedigree Query cargue normal,
      // el importador sigue solo.
      await page
        .waitForFunction(
          () => {
            const html = document.documentElement?.innerHTML || "";
            const text = document.body?.innerText || "";

            const hasPedigree = html.includes("pedigreetable");
            const stillCloudflare =
              /Just a moment|Enable JavaScript and cookies|Checking your browser|Verify you are human|Verifying you are human/i.test(
                text
              );

            return hasPedigree || !stillCloudflare;
          },
          { timeout: 180000 }
        )
        .catch(() => {});
    }

    html = await page.content();

    const finalUrl = page.url();

    if (!html.includes("pedigreetable") && isCloudflarePageHtml(html)) {
      throw new Error(
        "Pedigree Query sigue bloqueando con Cloudflare. Ahora Chromium se abre visible: completá la verificación humana en esa ventana y, cuando Pedigree Query cargue normal, volvé a importar."
      );
    }

    return {
      html,
      status: response?.status?.() || 200,
      finalUrl,
    };
  } catch (error) {
    const message = String(error?.message || error || "");

    if (
      message.includes("Executable doesn't exist") ||
      message.includes("browserType.launch") ||
      message.includes("Looks like Playwright")
    ) {
      throw new Error(
        "Playwright no tiene Chromium instalado. Corré en la terminal: npx playwright install chromium"
      );
    }

    throw error;
  } finally {
    if (context) {
      await context.close().catch(() => {});
    }
  }
}

function isCloudflarePageHtml(html) {
  const clean = cleanText(html);

  return /Just a moment|Enable JavaScript and cookies|Checking your browser|Verify you are human|Verifying you are human|cloudflare/i.test(
    clean
  );
}

function parseCookieHeaderForPlaywright(cookieHeader) {
  return String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const eqIndex = part.indexOf("=");

      if (eqIndex === -1) return null;

      const name = part.slice(0, eqIndex).trim();
      const value = part.slice(eqIndex + 1).trim();

      if (!name) return null;

      return {
        name,
        value,
        domain: ".pedigreequery.com",
        path: "/",
        httpOnly: false,
        secure: true,
        sameSite: "Lax",
      };
    })
    .filter(Boolean);
}

function buildLocalSuggestion(name) {
  const clean = String(name || "").trim();

  if (!clean) return null;

  const slug = makePedigreeSlug(clean);
  const externalKey = `${SOURCE}:${slug.replace(/\+/g, "-")}`;

  return {
    id: externalKey,
    externalKey,
    name: clean.toUpperCase(),
    displayName: clean.toUpperCase(),
    url: `${PQ_BASE}/${slug}`,
    source: SOURCE,
    sourceLabel: SOURCE_LABEL,
    exact: true,
  };
}

function buildHorseUrl(name) {
  return `${PQ_BASE}/${makePedigreeSlug(name)}`;
}

function makePedigreeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "+")
    .replace(/[^a-z0-9+]/g, "");
}

function normalizePedigreeQueryUrl(value) {
  const clean = String(value || "").trim();

  if (!clean) return "";

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  if (clean.startsWith("//")) {
    return `https:${clean}`;
  }

  if (clean.startsWith("/")) {
    return `${PQ_BASE}${clean}`;
  }

  return `${PQ_BASE}/${clean}`;
}

/* =========================
   PARSER
========================= */

function parsePedigreeQueryHtml(
  html,
  { sourceUrl = "", searchedName = "", generations = 5 } = {}
) {
  const source = String(html || "");
  const g = normalizeGenerations(generations);

  const rootHeader = extractRootHeader(source);
  const horseName =
    rootHeader.name ||
    extractHorseName(source, searchedName) ||
    normalizeHorseName(searchedName) ||
    "SIN NOMBRE";

  const rootUrl = sourceUrl || buildHorseUrl(horseName);
  const rootExternalKey = externalKeyFromUrl(rootUrl, horseName);

  const tableHtml = findMainPedigreeTable(source);
  const pedigreeCells = tableHtml ? extractPedigreeCells(tableHtml) : [];

  const rootHorse = makeHorseEntity({
    name: horseName,
    url: rootUrl,
    externalKey: rootExternalKey,
    sex: rootHeader.sex,
    sexRaw: rootHeader.sexRaw,
    country: rootHeader.country,
    coat: rootHeader.coat,
    birthYear: rootHeader.birthYear,
    family: rootHeader.family,
    dosage: rootHeader.dosage,
    sourceUrl: rootUrl,
    generation: 0,
  });

  let graph = buildGraphFromPedigreeCells({
    rootHorse,
    cells: pedigreeCells,
    maxGeneration: g,
  });

  if (!graph || graph.horses.length <= 1) {
    graph = buildFallbackGraphFromLinks({
      rootHorse,
      html: source,
      maxItems: Math.pow(2, Math.min(g, 6)) - 2,
    });
  }

  const pedigreeTree = buildTreeFromGraph(rootHorse.externalKey, graph, g);

  const sireKey =
    graph.relations.find(
      (rel) =>
        rel.childExternalKey === rootHorse.externalKey &&
        rel.relationType === "father"
    )?.parentExternalKey || "";

  const damKey =
    graph.relations.find(
      (rel) =>
        rel.childExternalKey === rootHorse.externalKey &&
        rel.relationType === "mother"
    )?.parentExternalKey || "";

  const sire = graph.horses.find((h) => h.externalKey === sireKey)?.name || "";
  const dam = graph.horses.find((h) => h.externalKey === damKey)?.name || "";

  const damsireKey =
    graph.relations.find(
      (rel) =>
        rel.childExternalKey === damKey && rel.relationType === "father"
    )?.parentExternalKey || "";

  const damsire =
    graph.horses.find((h) => h.externalKey === damsireKey)?.name || "";

  const missingParentSlots = detectMissingParentSlots(pedigreeTree, g);

  return {
    horse: rootHorse,
    horseName: rootHorse.name,
    name: rootHorse.name,

    sire,
    dam,
    damsire,
    missingParentSlots,

    pedigree: pedigreeTree,

    horses: graph.horses,
    relations: graph.relations,

    source: SOURCE,
    sourceLabel: SOURCE_LABEL,
    sourceUrl: rootUrl,

    importModel: {
      horseTable: "lineage_horses",
      relationTable: "lineage_horse_relations",
      uniqueHorseKey: "externalKey",
      uniqueRelationKey: "childExternalKey + relationType + parentExternalKey",
    },

    debug: {
      hasPedigreeTable: Boolean(tableHtml),
      cellsFound: pedigreeCells.length,
      horsesFound: graph.horses.length,
      relationsFound: graph.relations.length,
      rootExternalKey,
      generations: g,
      rootHeader,
    },
  };
}

/* =========================
   ROOT HEADER
========================= */

function extractRootHeader(html) {
  const source = String(html || "");
  const beforeTable =
    source.split(/<table[^>]*class=["']?pedigreetable/i)[0] || source;

  const rootLinkMatch =
    beforeTable.match(
      /<b[^>]*onMouseDown=["'][^"']*clickMenu\(['"]([^'"]+)['"][^"']*["'][^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>\s*<\/b>\s*([^<]*)/i
    ) ||
    beforeTable.match(
      /<b[^>]*>\s*<a[^>]*class=["'][^"']*nounderline[^"']*["'][^>]*>([\s\S]*?)<\/a>\s*<\/b>\s*([^<]*)/i
    );

  let name = "";
  let afterNameFromHtml = "";

  if (rootLinkMatch) {
    if (rootLinkMatch.length >= 4) {
      name = normalizeHorseName(rootLinkMatch[2]);
      afterNameFromHtml = cleanText(rootLinkMatch[3] || "");
    } else {
      name = normalizeHorseName(rootLinkMatch[1]);
      afterNameFromHtml = cleanText(rootLinkMatch[2] || "");
    }
  }

  if (!name) {
    name = extractHorseName(source, "");
  }

  const headerText = cleanText(beforeTable);
  const allText = cleanText(source);
  const htmlAttributeDetails = extractHtmlAttributeDetails(beforeTable);

  const detailText = [
    findHorseDetailsSnippet(headerText, name),
    findHorseDetailsSnippet(htmlAttributeDetails, name),
    findHorseDetailsSnippet(allText, name),
    htmlAttributeDetails,
    headerText,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const details = parseHorseDetailsFromCellText(detailText, name);

  const rootOnlyText = [
    name ? `${name} ${afterNameFromHtml}` : afterNameFromHtml,
    findRootOnlyDetailsSnippet(headerText, name),
    findRootOnlyDetailsSnippet(htmlAttributeDetails, name),
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const rootOnlyDetails = parseHorseDetailsFromCellText(rootOnlyText, name);

  const dosage =
    rootOnlyDetails.dosage ||
    details.dosage ||
    extractDosage(rootOnlyText) ||
    extractDosage(detailText) ||
    extractDosage(headerText) ||
    "";

  const rootBirthYear =
    extractRootBirthYearStrict({ beforeTable, headerText, htmlAttributeDetails, name }) ||
    rootOnlyDetails.birthYear ||
    "";

  return {
    name,
    country: rootOnlyDetails.country || details.country || "",
    sexRaw: rootOnlyDetails.sexRaw || details.sexRaw || "",
    sex: rootOnlyDetails.sex || details.sex || normalizeSex(rootOnlyDetails.sexRaw || details.sexRaw),
    coat: rootOnlyDetails.coat || details.coat || "",
    birthYear: rootBirthYear,
    family: rootOnlyDetails.family || details.family || "",
    chefDeRace: rootOnlyDetails.chefDeRace || details.chefDeRace || "",
    chef_de_race: rootOnlyDetails.chefDeRace || details.chefDeRace || "",
    dosage,
    dosageProfile: rootOnlyDetails.dosageProfile || details.dosageProfile || "",
    dosage_profile: rootOnlyDetails.dosageProfile || details.dosageProfile || "",
    dosageIndex: rootOnlyDetails.dosageIndex || details.dosageIndex || "",
    dosage_index: rootOnlyDetails.dosageIndex || details.dosageIndex || "",
    centerDistribution: rootOnlyDetails.centerDistribution || details.centerDistribution || "",
    center_distribution: rootOnlyDetails.centerDistribution || details.centerDistribution || "",
    gsv: rootOnlyDetails.gsv || details.gsv || "",
  };
}

function extractRootBirthYearStrict({ beforeTable, headerText, htmlAttributeDetails, name }) {
  const cleanName = normalizeHorseName(name);
  if (!cleanName) return "";

  const candidates = [];

  const rootHtmlAfterName = extractRootHtmlAfterName(beforeTable, cleanName);
  if (rootHtmlAfterName) candidates.push(cleanText(rootHtmlAfterName));

  const rootTextSnippet = findRootOnlyDetailsSnippet(headerText, cleanName);
  if (rootTextSnippet) candidates.push(rootTextSnippet);

  const rootAttrSnippet = findRootOnlyDetailsSnippet(htmlAttributeDetails, cleanName);
  if (rootAttrSnippet) candidates.push(rootAttrSnippet);

  for (const candidate of candidates) {
    const clean = stripCssBlocks(candidate);
    const parsed = parseHorseDetailsFromCellText(clean, cleanName);
    if (parsed.birthYear) return parsed.birthYear;

    const line = extractRootLineOnly(clean, cleanName);
    const year = line.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/)?.[1] || "";
    if (year && looksLikeRootHorseLine(line, cleanName)) return year;
  }

  return "";
}

function extractRootHtmlAfterName(html, name) {
  const source = String(html || "");
  const cleanName = normalizeHorseName(name);
  if (!source || !cleanName) return "";

  const anchorRegex = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = anchorRegex.exec(source))) {
    const label = normalizeHorseName(match[1] || "");
    if (label !== cleanName) continue;

    const start = match.index;
    const snippet = source.slice(start, start + 900);
    const stopMatch = snippet.match(/<table\b|5-Cross Pedigree|Reports?|Photos?|Progeny|Add to Virtual Stable/i);
    const end = typeof stopMatch?.index === "number" && stopMatch.index > 0 ? stopMatch.index : snippet.length;
    return snippet.slice(0, end);
  }

  return "";
}

function extractRootLineOnly(text, name) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  const cleanName = normalizeHorseName(name);
  if (!clean || !cleanName) return clean;

  const upper = clean.toUpperCase();
  const index = upper.indexOf(cleanName.toUpperCase());
  if (index < 0) return clean;

  const fromName = clean.slice(index);
  const stopPatterns = [
    /\s+5-Cross Pedigree/i,
    /\s+Dosage Profile/i,
    /\s+X-Factor/i,
    /\s+Reports?/i,
    /\s+Photos?/i,
    /\s+Progeny/i,
    /\s+Pedigree/i,
    /\s+Equineline/i,
    /\s+Add to Virtual Stable/i,
  ];

  let endIndex = Math.min(fromName.length, 500);
  stopPatterns.forEach((regex) => {
    const match = fromName.match(regex);
    if (typeof match?.index === "number" && match.index > 0) {
      endIndex = Math.min(endIndex, match.index);
    }
  });

  return fromName.slice(0, endIndex).replace(/\s+/g, " ").trim();
}

function looksLikeRootHorseLine(line, name) {
  const clean = String(line || "").replace(/\s+/g, " ").trim();
  const cleanName = normalizeHorseName(name);
  if (!clean || !cleanName) return false;

  const upper = clean.toUpperCase();
  if (!upper.includes(cleanName.toUpperCase())) return false;
  if (!/\([A-Z]{2,4}\)/.test(clean)) return false;

  return true;
}

function stripCssBlocks(value) {
  return String(value || "").replace(/\{[^}]*[:;][^}]*\}/g, " ");
}

function findRootOnlyDetailsSnippet(text, name) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  const cleanName = normalizeHorseName(name);

  if (!clean || !cleanName) return "";

  const upper = clean.toUpperCase();
  const index = upper.indexOf(cleanName.toUpperCase());

  if (index < 0) return "";

  const fromName = clean.slice(index);

  const stopPatterns = [
    /\s+5-Cross Pedigree/i,
    /\s+Dosage Profile/i,
    /\s+X-Factor/i,
    /\s+Reports?/i,
    /\s+Photos?/i,
    /\s+Progeny/i,
    /\s+Pedigree/i,
    /\s+Equineline/i,
    /\s+Add to Virtual Stable/i,
  ];

  let endIndex = Math.min(fromName.length, 420);

  stopPatterns.forEach((regex) => {
    const match = fromName.match(regex);
    if (typeof match?.index === "number" && match.index > 0) {
      endIndex = Math.min(endIndex, match.index);
    }
  });

  return fromName.slice(0, endIndex).replace(/\s+/g, " ").trim();
}

function findHorseDetailsSnippet(text, name) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  const cleanName = normalizeHorseName(name);

  if (!clean || !cleanName) return "";

  const upper = clean.toUpperCase();
  const index = upper.indexOf(cleanName.toUpperCase());

  if (index >= 0) {
    return clean.slice(index, index + 900);
  }

  const countryIndex = clean.search(/\([A-Z]{2,4}\)\s*(?:ch|dkch|b|br|blk|blk\/br|dkb\/br|buck|gr|gr\/r|pal|ro|w)\.?\s*(?:H|C|G|M|F|Horse|Colt|Gelding|Mare|Filly)?\s*,?\s*(?:18|19|20)\d{2}/i);

  if (countryIndex >= 0) {
    return `${cleanName} ${clean.slice(countryIndex, countryIndex + 900)}`;
  }

  return "";
}

function extractHtmlAttributeDetails(html) {
  const source = String(html || "");
  const pieces = [];

  const attrRegex = /\b(?:onMouseDown|onclick|title|alt|data-tooltip|data-title)\s*=\s*(["'])([\s\S]*?)\1/gi;
  let match;

  while ((match = attrRegex.exec(source))) {
    const raw = decodeHtml(match[2] || "");
    const cleaned = raw
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/clickMenu\s*\(/gi, " ")
      .replace(/[()]/g, " ")
      .replace(/[;,]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned) pieces.push(cleaned);
  }

  const quotedRegex = /['"]([^'"]*(?:\([A-Z]{2,4}\)|\{[^}]+\}|\b(?:18|19|20)\d{2}\b)[^'"]*)['"]/gi;

  while ((match = quotedRegex.exec(source))) {
    const cleaned = cleanText(match[1] || "");
    if (cleaned) pieces.push(cleaned);
  }

  return [...new Set(pieces)].join(" ");
}

function buildHorseDetailsTextFromHtml(html, fallbackText = "") {
  return [
    cleanText(fallbackText),
    cleanText(html),
    extractHtmlAttributeDetails(html),
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDosage(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();

  const dp =
    clean
      .match(/DP\s*=\s*([^&]+?)(?=\s+DI\s*=|\s+CD\s*=|\s+-\s+GSV|$)/i)?.[1]
      ?.trim() || "";

  const di = clean.match(/DI\s*=\s*([0-9.]+)/i)?.[1] || "";
  const cd = clean.match(/CD\s*=\s*([0-9.-]+)/i)?.[1] || "";
  const gsv = clean.match(/GSV\s*=\s*([0-9.]+)/i)?.[1] || "";

  if (!dp && !di && !cd && !gsv) return "";

  return [
    dp ? `DP = ${dp}` : "",
    di ? `DI = ${di}` : "",
    cd ? `CD = ${cd}` : "",
    gsv ? `GSV = ${gsv}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function extractHorseName(html, searchedName = "") {
  const title = htmlMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/is);

  const fromTitle = normalizeHorseName(
    title
      .replace(/\bHORSE PEDIGREE\b/gi, "")
      .replace(/\bPEDIGREE QUERY\b/gi, "")
      .replace(/\bPEDIGREE\b/gi, "")
      .replace(/\bTHOROUGHBRED\b/gi, "")
      .replace(/\bDATABASE\b/gi, "")
  );

  if (fromTitle && !isBadHorseName(fromTitle)) return fromTitle;

  return normalizeHorseName(searchedName);
}

/* =========================
   PEDIGREE TABLE
========================= */

function findMainPedigreeTable(html) {
  const source = String(html || "");

  const startMatch = source.match(
    /<table\b[^>]*class=["']?[^"'>]*pedigreetable[^"'>]*["']?[^>]*>/i
  );

  if (!startMatch) return "";

  const start = startMatch.index || 0;
  const end = findMatchingTableEnd(source, start);

  if (end <= start) return "";

  return source.slice(start, end);
}

function findMatchingTableEnd(html, startIndex) {
  const source = String(html || "");
  const tableRegex = /<\/?table\b[^>]*>/gi;

  tableRegex.lastIndex = startIndex;

  let depth = 0;
  let match;

  while ((match = tableRegex.exec(source))) {
    const tag = match[0] || "";
    const isClosing = /^<\/table/i.test(tag);

    if (!isClosing) {
      depth += 1;
    } else {
      depth -= 1;

      if (depth === 0) {
        return tableRegex.lastIndex;
      }
    }
  }

  return -1;
}

function extractPedigreeCells(tableHtml) {
  const cells = [];
  const tdRegex = /<td\b([^>]*)>([\s\S]*?)<\/td>/gi;

  let match;
  let index = 0;

  while ((match = tdRegex.exec(String(tableHtml || "")))) {
    const attrs = match[1] || "";
    const content = match[2] || "";

    const generation = parseInt(attrValue(attrs, "data-g") || "0", 10);

    if (!generation) continue;

    const className = attrValue(attrs, "class");
    const sex = classNameToSex(className);

    const horse = extractHorseFromPedigreeCell(content);

    if (!horse?.name) continue;

    const cellText = cleanText(content);
    const detailsText = buildHorseDetailsTextFromHtml(content, cellText);
    const details = parseHorseDetailsFromCellText(detailsText, horse.name);

    cells.push({
      index,
      generation,
      dataGeneration: generation,
      sex,
      className,
      rawHtml: content,
      text: cellText,
      horse: {
        ...horse,
        sex: horse.sex || details.sex || sex,
        sexRaw:
          horse.sexRaw ||
          details.sexRaw ||
          (sex === "HEMBRA" ? "F" : sex === "MACHO" ? "H" : ""),
        country: horse.country || details.country || "",
        coat: horse.coat || details.coat || "",
        birthYear: horse.birthYear || details.birthYear || "",
        family: horse.family || details.family || "",
        chefDeRace: horse.chefDeRace || details.chefDeRace || "",
        chef_de_race: horse.chef_de_race || details.chef_de_race || "",
        dosage: details.dosage || "",
        dosageProfile: details.dosageProfile || details.dosage_profile || "",
        dosage_profile: details.dosage_profile || details.dosageProfile || "",
        dosageIndex: details.dosageIndex || details.dosage_index || "",
        dosage_index: details.dosage_index || details.dosageIndex || "",
        centerDistribution: details.centerDistribution || details.center_distribution || "",
        center_distribution: details.center_distribution || details.centerDistribution || "",
        gsv: details.gsv || "",
        record: details.record || "",
        earnings: details.earnings || "",
        summary: details.summary || "",
        generation,
      },
    });

    index += 1;
  }

  return cells;
}

function extractHorseFromPedigreeCell(cellHtml) {
  const source = String(cellHtml || "");

  const linkMatch =
    source.match(
      /<a\b[^>]*href=["']([^"']+)["'][^>]*class=["'][^"']*horseName[^"']*["'][^>]*>([\s\S]*?)<\/a>/i
    ) ||
    source.match(
      /<a\b[^>]*class=["'][^"']*horseName[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i
    );

  if (!linkMatch) return null;

  const href = decodeHtml(linkMatch[1] || "").trim();
  const name = normalizeHorseName(linkMatch[2] || "");

  if (!name || shouldIgnoreLink(name, href)) return null;

  const url = normalizePedigreeQueryUrl(href);
  const externalKey = externalKeyFromUrl(url, name);

  const fullText = buildHorseDetailsTextFromHtml(source, cleanText(source));
  const details = parseHorseDetailsFromCellText(fullText, name);

  return {
    name,
    url,
    externalKey,
    country: String(details.country || "").toUpperCase(),
    sex: details.sex || "",
    sexRaw: details.sexRaw || "",
    coat: details.coat || "",
    birthYear: details.birthYear || "",
    family: details.family || "",
    chefDeRace: details.chefDeRace || "",
    chef_de_race: details.chef_de_race || "",
    dosage: details.dosage || "",
    dosageProfile: details.dosageProfile || "",
    dosage_profile: details.dosage_profile || "",
    dosageIndex: details.dosageIndex || "",
    dosage_index: details.dosage_index || "",
    centerDistribution: details.centerDistribution || "",
    center_distribution: details.center_distribution || "",
    gsv: details.gsv || "",
    sourceUrl: url,
  };
}

function parseHorseDetailsFromCellText(text, name) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  const cleanName = normalizeHorseName(name);

  const upperClean = clean.toUpperCase();
  const upperName = cleanName.toUpperCase();
  const nameIndex = upperName ? upperClean.indexOf(upperName) : -1;

  const afterName = nameIndex >= 0
    ? clean.slice(nameIndex + cleanName.length).trim()
    : clean;

  const country = afterName.match(/\(([A-Z]{2,4})\)/)?.[1] || "";

  const colorPattern =
    "dkb\\/br|blk\\/br|gr\\/r|dark bay\\/brown|black\\/brown|gray\\/roan|grey\\/roan|dark chestnut|dkch|buckskin\\/dun|buck|chestnut|black|brown|bay|gray|grey|palomino|roan|white|blk|br|ch|b|gr|pal|ro|w";

  const sexPattern =
    "Horse|Colt|Stallion|Gelding|Mare|Filly|Female|Male|H|C|G|M|F";

  const colorSexYearRegex = new RegExp(
    `\\b(${colorPattern})\\.?\\s*(?:(${sexPattern})\\.?\\s*)?,?\\s*((?:18|19|20)\\d{2})\\b`,
    "i"
  );

  const colorSexYear = afterName.match(colorSexYearRegex) || [];

  const rawCoat = colorSexYear[1] || "";
  let sexRaw = String(colorSexYear[2] || "").toUpperCase().replace(/\.$/, "");
  const birthYear = colorSexYear[3] || afterName.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/)?.[1] || "";

  if (!sexRaw && birthYear) {
    const beforeYear = afterName.slice(0, afterName.indexOf(birthYear));
    sexRaw =
      beforeYear.match(/\b(Horse|Colt|Stallion|Gelding|Mare|Filly|Female|Male|H|C|G|M|F)\.?\s*,?\s*$/i)?.[1]?.toUpperCase() || "";
  }

  const coat = normalizeCoat(rawCoat);
  const sex = normalizeSex(sexRaw);

  const family = extractFamilyFromText(afterName);
  const chefDeRace = afterName.match(/\[([^\]]+)\]/)?.[1]?.trim() || "";

  const dosageProfile =
    afterName.match(/DP\s*=\s*([^·]+?)(?=\s+DI\s*=|\s+CD\s*=|\s*-\s*GSV|$)/i)?.[1]?.trim() || "";

  const dosageIndex = afterName.match(/DI\s*=\s*([0-9.]+)/i)?.[1] || "";
  const centerDistribution = afterName.match(/CD\s*=\s*([0-9.-]+)/i)?.[1] || "";
  const gsv = afterName.match(/GSV\s*=\s*([0-9.]+)/i)?.[1] || "";

  const dosage = [
    dosageProfile ? `DP = ${dosageProfile}` : "",
    dosageIndex ? `DI = ${dosageIndex}` : "",
    centerDistribution ? `CD = ${centerDistribution}` : "",
    gsv ? `GSV = ${gsv}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const record =
    afterName.match(/\b\d+\s+Starts?,\s*\d+\s+Wins?[^C]*/i)?.[0]?.trim() ||
    afterName.match(/\b\d+[-–]\d+[-–?]\d+[-–?]\d+\b/)?.[0] ||
    "";

  const earnings =
    afterName.match(/Career Earnings:\s*([$£€]?[0-9][0-9,.\s]*)/i)?.[1]?.trim() ||
    afterName.match(/[$£€]\s?[0-9][0-9,.\s]*/i)?.[0]?.trim() ||
    "";

  const summary = afterName
    .replace(/\(([A-Z]{2,4})\)/g, " ")
    .replace(/\{([^}]+)\}/g, " ")
    .replace(/\[([^\]]+)\]/g, " ")
    .replace(/DP\s*=\s*[^·]+?(?=\s+DI\s*=|\s+CD\s*=|\s*-\s*GSV|$)/gi, " ")
    .replace(/DI\s*=\s*[0-9.]+/gi, " ")
    .replace(/CD\s*=\s*[0-9.-]+/gi, " ")
    .replace(/GSV\s*=\s*[0-9.]+/gi, " ")
    .replace(new RegExp(`\\b(${colorPattern})\\.?\\s*(?:(${sexPattern})\\.?\\s*)?,?\\s*((?:18|19|20)\\d{2})\\b`, "gi"), " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    country: country.toUpperCase(),
    coat,
    sexRaw,
    sex,
    birthYear,
    family,
    chefDeRace,
    chef_de_race: chefDeRace,
    dosage,
    dosageProfile,
    dosage_profile: dosageProfile,
    dosageIndex,
    dosage_index: dosageIndex,
    centerDistribution,
    center_distribution: centerDistribution,
    gsv,
    record,
    earnings,
    summary,
  };
}

/* =========================
   GRAPH
========================= */

function buildGraphFromPedigreeCells({ rootHorse, cells, maxGeneration = 5 }) {
  const horsesMap = new Map();
  const relationsMap = new Map();

  addHorse(horsesMap, rootHorse);

  const orderedCells = [...(cells || [])]
    .filter((cell) => cell?.horse?.name && cell.generation >= 1)
    .filter((cell) => cell.generation <= maxGeneration)
    .sort((a, b) => a.index - b.index);

  orderedCells.forEach((cell) => {
    addHorse(
      horsesMap,
      makeHorseEntity({
        name: cell.horse.name,
        url: cell.horse.url,
        externalKey: cell.horse.externalKey,
        sex: cell.horse.sex,
        sexRaw: cell.horse.sexRaw,
        country: cell.horse.country,
        coat: cell.horse.coat,
        birthYear: cell.horse.birthYear,
        family: cell.horse.family,
        chefDeRace: cell.horse.chefDeRace || cell.horse.chef_de_race,
        dosage: cell.horse.dosage,
        dosageProfile: cell.horse.dosageProfile || cell.horse.dosage_profile,
        dosageIndex: cell.horse.dosageIndex || cell.horse.dosage_index,
        centerDistribution:
          cell.horse.centerDistribution || cell.horse.center_distribution,
        gsv: cell.horse.gsv,
        record: cell.horse.record,
        earnings: cell.horse.earnings,
        summary: cell.horse.summary,
        sourceUrl: cell.horse.sourceUrl || cell.horse.url,
        generation: cell.generation,
      })
    );
  });

  let cursor = 0;

  function parseNode(expectedGeneration) {
    const cell = orderedCells[cursor];

    if (!cell || cell.generation !== expectedGeneration) return null;

    cursor += 1;

    const node = cell.horse;

    if (expectedGeneration < maxGeneration) {
      const father = parseNode(expectedGeneration + 1);
      const mother = parseNode(expectedGeneration + 1);

      if (father) {
        addRelation(relationsMap, {
          childExternalKey: node.externalKey,
          parentExternalKey: father.externalKey,
          relationType: "father",
        });
      }

      if (mother) {
        addRelation(relationsMap, {
          childExternalKey: node.externalKey,
          parentExternalKey: mother.externalKey,
          relationType: "mother",
        });
      }
    }

    return node;
  }

  const father = parseNode(1);
  const mother = parseNode(1);

  if (father) {
    addRelation(relationsMap, {
      childExternalKey: rootHorse.externalKey,
      parentExternalKey: father.externalKey,
      relationType: "father",
    });
  }

  if (mother) {
    addRelation(relationsMap, {
      childExternalKey: rootHorse.externalKey,
      parentExternalKey: mother.externalKey,
      relationType: "mother",
    });
  }

  return {
    horses: [...horsesMap.values()],
    relations: [...relationsMap.values()],
  };
}

function buildFallbackGraphFromLinks({ rootHorse, html, maxItems = 62 }) {
  const horsesMap = new Map();
  const relationsMap = new Map();

  addHorse(horsesMap, rootHorse);

  const links = parseHorseLinksFromHtml(html)
    .filter((item) => item.externalKey !== rootHorse.externalKey)
    .slice(0, maxItems);

  const nodes = links.map((item) =>
    makeHorseEntity({
      name: item.name,
      url: item.url,
      externalKey: item.externalKey,
      sourceUrl: item.url,
    })
  );

  nodes.forEach((horse) => addHorse(horsesMap, horse));

  const get = (i) => nodes[i] || null;

  if (get(0)) {
    addRelation(relationsMap, {
      childExternalKey: rootHorse.externalKey,
      parentExternalKey: get(0).externalKey,
      relationType: "father",
    });
  }

  if (get(1)) {
    addRelation(relationsMap, {
      childExternalKey: rootHorse.externalKey,
      parentExternalKey: get(1).externalKey,
      relationType: "mother",
    });
  }

  return {
    horses: [...horsesMap.values()],
    relations: [...relationsMap.values()],
  };
}

function parseHorseLinksFromHtml(html) {
  const links = [
    ...String(html || "").matchAll(
      /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    ),
  ];

  return links
    .map((match) => {
      const href = decodeHtml(match[1] || "").trim();
      const label = normalizeHorseName(match[2] || "");

      if (!label) return null;
      if (shouldIgnoreLink(label, href)) return null;

      const fullUrl = normalizePedigreeQueryUrl(href);
      const externalKey = externalKeyFromUrl(fullUrl, label);

      return {
        id: externalKey,
        externalKey,
        name: label,
        displayName: label,
        url: fullUrl,
        source: SOURCE,
        sourceLabel: SOURCE_LABEL,
      };
    })
    .filter(Boolean);
}

function buildTreeFromGraph(rootExternalKey, graph, maxDepth = 5) {
  const horsesByKey = new Map(
    (graph.horses || []).map((horse) => [horse.externalKey, horse])
  );

  const relations = graph.relations || [];

  function buildNode(externalKey, depth = 0, visited = new Set()) {
    if (!externalKey) return null;
    if (visited.has(externalKey)) return null;

    const horse = horsesByKey.get(externalKey);
    if (!horse) return null;

    const nextVisited = new Set(visited);
    nextVisited.add(externalKey);

    const fatherKey =
      relations.find(
        (rel) =>
          rel.childExternalKey === externalKey &&
          rel.relationType === "father"
      )?.parentExternalKey || "";

    const motherKey =
      relations.find(
        (rel) =>
          rel.childExternalKey === externalKey &&
          rel.relationType === "mother"
      )?.parentExternalKey || "";

    return {
      id: horse.id || null,
      externalKey: horse.externalKey,
      external_key: horse.externalKey,
      name: horse.name,
      country: horse.country || "",
      sex: horse.sex || "",
      sexRaw: horse.sexRaw || horse.sex_raw || "",
      coat: horse.coat || "",
      birthYear: horse.birthYear || "",
      birth_year: horse.birthYear || "",
      birthdate: horse.birthYear || "",
      family: horse.family || "",
      chefDeRace: horse.chefDeRace || horse.chef_de_race || "",
      chef_de_race: horse.chef_de_race || horse.chefDeRace || "",
      dosage: horse.dosage || "",
      dosageProfile: horse.dosageProfile || horse.dosage_profile || "",
      dosage_profile: horse.dosage_profile || horse.dosageProfile || "",
      dosageIndex: horse.dosageIndex || horse.dosage_index || "",
      dosage_index: horse.dosage_index || horse.dosageIndex || "",
      centerDistribution: horse.centerDistribution || horse.center_distribution || "",
      center_distribution: horse.center_distribution || horse.centerDistribution || "",
      gsv: horse.gsv || "",
      record: horse.record || "",
      earnings: horse.earnings || "",
      summary: horse.summary || "",
      source: horse.source,
      sourceLabel: horse.sourceLabel,
      sourceUrl: horse.sourceUrl,
      father:
        depth < maxDepth
          ? buildNode(fatherKey, depth + 1, nextVisited)
          : null,
      mother:
        depth < maxDepth
          ? buildNode(motherKey, depth + 1, nextVisited)
          : null,
    };
  }

  return buildNode(rootExternalKey);
}

/* =========================
   ENTITIES
========================= */

function makeHorseEntity({
  name,
  url = "",
  externalKey = "",
  sex = "",
  sexRaw = "",
  country = "",
  coat = "",
  birthYear = "",
  family = "",
  chefDeRace = "",
  chef_de_race = "",
  dosage = "",
  dosageProfile = "",
  dosage_profile = "",
  dosageIndex = "",
  dosage_index = "",
  centerDistribution = "",
  center_distribution = "",
  gsv = "",
  record = "",
  earnings = "",
  summary = "",
  sourceUrl = "",
  generation = "",
}) {
  const cleanName = normalizeHorseName(name);
  const finalUrl = url
    ? normalizePedigreeQueryUrl(url)
    : buildHorseUrl(cleanName);

  const finalExternalKey =
    externalKey || externalKeyFromUrl(finalUrl, cleanName);

  return {
    id: null,
    externalKey: finalExternalKey,
    external_key: finalExternalKey,

    name: cleanName,

    country: String(country || "").toUpperCase(),
    sex: normalizeSex(sex || sexRaw),
    sexRaw: String(sexRaw || "").toUpperCase(),
    sex_raw: String(sexRaw || "").toUpperCase(),
    coat: normalizeCoat(coat),
    birthYear: String(birthYear || "").trim(),
    birth_year: String(birthYear || "").trim(),

    family: cleanFamilyValue(family),
    chefDeRace: String(chefDeRace || chef_de_race || "")
      .replace(/[\[\]]/g, "")
      .trim(),
    chef_de_race: String(chef_de_race || chefDeRace || "")
      .replace(/[\[\]]/g, "")
      .trim(),
    dosage: String(dosage || "").trim(),
    dosageProfile: String(dosageProfile || dosage_profile || "").trim(),
    dosage_profile: String(dosage_profile || dosageProfile || "").trim(),
    dosageIndex: String(dosageIndex || dosage_index || "").trim(),
    dosage_index: String(dosage_index || dosageIndex || "").trim(),
    centerDistribution: String(centerDistribution || center_distribution || "").trim(),
    center_distribution: String(center_distribution || centerDistribution || "").trim(),
    gsv: String(gsv || "").trim(),
    record: String(record || "").trim(),
    earnings: String(earnings || "").trim(),
    summary: String(summary || "").trim(),
    generation,

    source: SOURCE,
    sourceLabel: SOURCE_LABEL,
    source_label: SOURCE_LABEL,
    sourceUrl: sourceUrl || finalUrl,
    source_url: sourceUrl || finalUrl,
  };
}

function addHorse(map, horse) {
  if (!horse?.externalKey || !horse?.name) return;

  const existing = map.get(horse.externalKey);

  if (!existing) {
    map.set(horse.externalKey, horse);
    return;
  }

  map.set(horse.externalKey, {
    ...existing,
    ...horse,
    name: existing.name || horse.name,
    country: existing.country || horse.country,
    sex: existing.sex || horse.sex,
    sexRaw: existing.sexRaw || horse.sexRaw,
    coat: existing.coat || horse.coat,
    birthYear: existing.birthYear || horse.birthYear,
    family: existing.family || horse.family,
    chefDeRace: existing.chefDeRace || horse.chefDeRace,
    chef_de_race: existing.chef_de_race || horse.chef_de_race,
    dosage: existing.dosage || horse.dosage,
    dosageProfile: existing.dosageProfile || horse.dosageProfile,
    dosage_profile: existing.dosage_profile || horse.dosage_profile,
    dosageIndex: existing.dosageIndex || horse.dosageIndex,
    dosage_index: existing.dosage_index || horse.dosage_index,
    centerDistribution: existing.centerDistribution || horse.centerDistribution,
    center_distribution: existing.center_distribution || horse.center_distribution,
    gsv: existing.gsv || horse.gsv,
    record: existing.record || horse.record,
    earnings: existing.earnings || horse.earnings,
    summary: existing.summary || horse.summary,
    sourceUrl: existing.sourceUrl || horse.sourceUrl,
    source_url: existing.source_url || horse.source_url,
  });
}

function addRelation(map, relation) {
  if (!relation?.childExternalKey || !relation?.parentExternalKey) return;
  if (relation.childExternalKey === relation.parentExternalKey) return;

  const key = `${relation.childExternalKey}__${relation.relationType}__${relation.parentExternalKey}`;

  if (map.has(key)) return;

  map.set(key, {
    id: null,
    childExternalKey: relation.childExternalKey,
    child_external_key: relation.childExternalKey,
    parentExternalKey: relation.parentExternalKey,
    parent_external_key: relation.parentExternalKey,
    relationType: relation.relationType,
    relation_type: relation.relationType,
    source: SOURCE,
  });
}

/* =========================
   NORMALIZERS
========================= */

function externalKeyFromUrl(url, fallbackName = "") {
  const cleanUrl = String(url || "").trim();

  try {
    const u = new URL(normalizePedigreeQueryUrl(cleanUrl));
    const rawPath = decodeURIComponent(u.pathname || "")
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");

    const slug =
      rawPath ||
      String(fallbackName || "")
        .trim()
        .replace(/\s+/g, "+");

    return `${SOURCE}:${slugifyName(slug)}`;
  } catch {
    return `${SOURCE}:${slugifyName(fallbackName)}`;
  }
}

function slugifyName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/&/g, "and")
    .replace(/\+/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeHorseName(value) {
  let clean = cleanText(value);

  if (!clean) return "";

  clean = clean
    .replace(/\s+-\s+.*PEDIGREE.*$/i, "")
    .replace(/\s+\|\s+.*PEDIGREE.*$/i, "")
    .replace(/\bPEDIGREE QUERY\b/gi, "")
    .replace(/\bPEDIGREE\b/gi, "")
    .replace(/\bTHOROUGHBRED\b/gi, "")
    .replace(/\bDATABASE\b/gi, "")
    .replace(/\bHORSE PROFILE\b/gi, "")
    .replace(/\bFAMILY\b/gi, "")
    .replace(/\bREPORT\b/gi, "")
    .replace(/\bPHOTOS?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return "";

  return clean.toUpperCase();
}

function normalizeSex(value) {
  const clean = String(value || "").toUpperCase().trim().replace(/\.$/, "");

  if (!clean) return "";

  if (clean === "MACHO") return "MACHO";
  if (clean === "HEMBRA") return "HEMBRA";
  if (clean === "CASTRADO") return "CASTRADO";

  if (clean === "H" || clean === "C") return "MACHO";
  if (clean === "G") return "CASTRADO";

  if (clean === "M" || clean === "F") return "HEMBRA";

  if (clean.includes("GELDING") || clean.includes("CASTRADO")) return "CASTRADO";
  if (clean.includes("HORSE") || clean.includes("COLT") || clean.includes("STALLION")) return "MACHO";
  if (clean.includes("MARE") || clean.includes("FILLY") || clean.includes("FEMALE")) return "HEMBRA";
  if (clean.includes("MALE")) return "MACHO";

  return clean;
}

function classNameToSex(className) {
  const clean = String(className || "").toLowerCase();

  if (clean.split(/\s+/).includes("f")) return "HEMBRA";
  if (clean.split(/\s+/).includes("m")) return "MACHO";
  if (clean.includes("xf")) return "HEMBRA";
  if (clean.includes("xm")) return "MACHO";

  return "";
}

function normalizeCoat(value) {
  const clean = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\.$/, "")
    .replace(/\s+/g, " ");

  if (!clean) return "";

  const zaino = new Set([
    "b",
    "bay",
    "blk",
    "black",
    "blk/br",
    "black/brown",
    "br",
    "brown",
    "buck",
    "buckskin/dun",
    "dkb/br",
    "dark bay/brown",
    "dkb",
  ]);

  const alazan = new Set([
    "ch",
    "chestnut",
    "dkch",
    "dark chestnut",
  ]);

  const tordillo = new Set([
    "gr",
    "gray",
    "grey",
    "gr/r",
    "gray/roan",
    "grey/roan",
    "pal",
    "palomino",
    "ro",
    "roan",
    "w",
    "white",
  ]);

  if (zaino.has(clean)) return "ZAINO";
  if (alazan.has(clean)) return "ALAZAN";
  if (tordillo.has(clean)) return "TORDILLO";

  return clean.toUpperCase();
}

function bodySafeNumber(value) {
  const n = Number(value);

  return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizeGenerations(value) {
  const n = Number(value || 5);

  if (!Number.isFinite(n)) return 5;
  if (n < 4) return 4;
  if (n > 9) return 9;

  return Math.round(n);
}

function shouldIgnoreLink(label, href) {
  const l = String(label || "").toUpperCase().trim();
  const h = String(href || "").toLowerCase();

  if (!l) return true;

  const badLabels = [
    "HOME",
    "HELP",
    "LOGIN",
    "LOG IN",
    "LOGOUT",
    "LOG OUT",
    "REGISTER",
    "REPORT",
    "CONTACT",
    "DATABASE",
    "PEDIGREE",
    "PEDIGREE QUERY",
    "QUERY",
    "SEARCH",
    "SUBMIT",
    "ADD",
    "EDIT",
    "PHOTOS",
    "PHOTO",
    "MARE",
    "STALLION",
    "HORSE",
    "FORUM",
    "PRIVACY",
    "TERMS",
    "PDF",
    "CLOSE",
  ];

  if (badLabels.includes(l)) return true;
  if (l.length > 80) return true;
  if (/^\d+$/.test(l)) return true;
  if (h.includes("javascript:")) return true;
  if (h.includes("mailto:")) return true;
  if (h.includes("google")) return true;

  return false;
}

function isBadHorseName(value) {
  const clean = String(value || "").toUpperCase().trim();

  return [
    "PEDIGREE QUERY",
    "PEDIGREE",
    "THOROUGHBRED DATABASE",
    "DATABASE",
    "SEARCH",
    "LOGIN",
    "HOME",
  ].includes(clean);
}

/* =========================
   ENRIQUECER ANTECESORES CON SU PROPIA FICHA
========================= */

async function enrichImportedPedigreeWithHorsePages(payload) {
  const data = payload || {};
  const horses = Array.isArray(data.horses) ? data.horses : [];

  if (!horses.length) return data;

  const rootKey = data?.horse?.externalKey || data?.horse?.external_key || "";
  const maxPages = Number(
    process.env.PEDIGREE_QUERY_ENRICH_LIMIT ||
      bodySafeNumber(data?.enrichLimit) ||
      80
  );

  const horsesToEnrich = horses
    .filter((horse) => horse?.sourceUrl || horse?.source_url)
    .filter((horse) => {
      const key = horse.externalKey || horse.external_key || "";
      if (key && key === rootKey) return false;

      return needsHorseDetailsEnrichment(horse);
    })
    .slice(0, Number.isFinite(maxPages) && maxPages > 0 ? maxPages : 8);

  if (!horsesToEnrich.length) return data;

  let browser = null;

  try {
    browser = await chromium.launch({
      headless: false,
      timeout: 60000,
      slowMo: 60,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--no-sandbox",
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1365, height: 900 },
      locale: "es-ES",
      timezoneId: "America/New_York",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
      extraHTTPHeaders: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        Referer: "https://www.pedigreequery.com/",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    const cookieText = String(process.env.PEDIGREE_QUERY_COOKIE || "").trim();

    if (cookieText) {
      await context.addCookies(parseCookieHeaderForPlaywright(cookieText));
    }

    const page = await context.newPage();
    const enrichedByKey = new Map();

    for (const horse of horsesToEnrich) {
      const key = horse.externalKey || horse.external_key || "";
      const url = normalizePedigreeQueryUrl(horse.sourceUrl || horse.source_url || "");

      if (!key || !url) continue;

      try {
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });

        await page.waitForTimeout(250);

        const html = await page.content();
        const header = extractRootHeader(html);

        const enriched = makeHorseEntity({
          ...horse,
          name: horse.name || header.name,
          url,
          externalKey: key,
          country: horse.country || header.country,
          sex: horse.sex || header.sex,
          sexRaw: horse.sexRaw || horse.sex_raw || header.sexRaw,
          coat: horse.coat || header.coat,
          birthYear: horse.birthYear || horse.birth_year || header.birthYear,
          family: cleanFamilyValue(horse.family) || cleanFamilyValue(header.family),
          chefDeRace:
            horse.chefDeRace ||
            horse.chef_de_race ||
            header.chefDeRace ||
            header.chef_de_race,
          dosage: horse.dosage || header.dosage,
          dosageProfile:
            horse.dosageProfile ||
            horse.dosage_profile ||
            header.dosageProfile ||
            header.dosage_profile,
          dosageIndex:
            horse.dosageIndex ||
            horse.dosage_index ||
            header.dosageIndex ||
            header.dosage_index,
          centerDistribution:
            horse.centerDistribution ||
            horse.center_distribution ||
            header.centerDistribution ||
            header.center_distribution,
          gsv: horse.gsv || header.gsv,
          sourceUrl: url,
          generation: horse.generation,
        });

        enrichedByKey.set(key, enriched);
      } catch {
        // Si Pedigree Query bloquea una ficha individual, no rompemos toda la importación.
      }
    }

    if (!enrichedByKey.size) return data;

    const finalHorses = horses.map((horse) => {
      const key = horse.externalKey || horse.external_key || "";
      const enriched = enrichedByKey.get(key);

      if (!enriched) return horse;

      return mergeHorseDetails(horse, enriched);
    });

    let finalPedigree = data.pedigree;

    enrichedByKey.forEach((enriched, key) => {
      finalPedigree = mergeHorseIntoPedigreeTree(finalPedigree, key, enriched);
    });

    return {
      ...data,
      horses: finalHorses,
      pedigree: finalPedigree,
      debug: {
        ...(data.debug || {}),
        enrichedRelatedHorses: enrichedByKey.size,
      },
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

function needsHorseDetailsEnrichment(horse) {
  if (!horse) return false;

  return (
    !cleanNullable(horse.country) ||
    !cleanNullable(horse.sex) ||
    !cleanNullable(horse.sexRaw || horse.sex_raw) ||
    !cleanNullable(horse.coat) ||
    !cleanNullable(horse.birthYear || horse.birth_year) ||
    !cleanNullable(cleanFamilyValue(horse.family)) ||
    !cleanNullable(horse.chefDeRace || horse.chef_de_race)
  );
}

function mergeHorseDetails(base, incoming) {
  const merged = { ...(base || {}) };

  const fields = [
    ["country", incoming.country],
    ["sex", incoming.sex],
    ["sexRaw", incoming.sexRaw || incoming.sex_raw],
    ["sex_raw", incoming.sex_raw || incoming.sexRaw],
    ["coat", incoming.coat],
    ["birthYear", incoming.birthYear || incoming.birth_year],
    ["birth_year", incoming.birth_year || incoming.birthYear],
    ["family", cleanFamilyValue(incoming.family)],
    ["chefDeRace", incoming.chefDeRace || incoming.chef_de_race],
    ["chef_de_race", incoming.chef_de_race || incoming.chefDeRace],
    ["dosage", incoming.dosage],
    ["dosageProfile", incoming.dosageProfile || incoming.dosage_profile],
    ["dosage_profile", incoming.dosage_profile || incoming.dosageProfile],
    ["dosageIndex", incoming.dosageIndex || incoming.dosage_index],
    ["dosage_index", incoming.dosage_index || incoming.dosageIndex],
    ["centerDistribution", incoming.centerDistribution || incoming.center_distribution],
    ["center_distribution", incoming.center_distribution || incoming.centerDistribution],
    ["gsv", incoming.gsv],
  ];

  fields.forEach(([field, value]) => {
    const clean = field === "family" ? cleanFamilyValue(value) : cleanNullable(value);
    if (!clean) return;

    const current = field === "family" ? cleanFamilyValue(merged[field]) : cleanNullable(merged[field]);

    if (!current) {
      merged[field] = clean;
    }
  });

  return merged;
}

function mergeHorseIntoPedigreeTree(node, externalKey, horse) {
  if (!node || !externalKey) return node;

  const nodeKey = node.externalKey || node.external_key || "";
  const current =
    nodeKey === externalKey ? mergeHorseDetails(node, horse) : { ...node };

  return {
    ...current,
    father: current.father
      ? mergeHorseIntoPedigreeTree(current.father, externalKey, horse)
      : current.father,
    mother: current.mother
      ? mergeHorseIntoPedigreeTree(current.mother, externalKey, horse)
      : current.mother,
  };
}


/* =========================
   BUSCAR CABALLOS EXISTENTES EN LINEAGE
========================= */

async function searchLocalHorses(query) {
  const cleanQuery = normalizeSearchText(query);

  if (cleanQuery.length < 2) {
    return { horses: [] };
  }

  const supabase = getSupabaseAdmin();
  const like = `%${cleanQuery}%`;

  const { data, error } = await supabase
    .from("lineage_horses")
    .select(LOCAL_HORSE_SELECT)
    .ilike("name", like)
    .order("name", { ascending: true })
    .limit(25);

  if (error) {
    throw new Error(`Error buscando caballos en la base: ${error.message}`);
  }

  const rows = data || [];
  const localTree = await buildLocalPedigreeTreesForRows(supabase, rows, 5);

  return {
    horses: rows.map((horse) => {
      const key = horse.external_key || "";
      const tree = localTree.treesByKey.get(key) || null;

      return {
        ...localHorseRowToApi(horse),
        father: tree?.father || null,
        mother: tree?.mother || null,
        localPedigreeHorses: localTree.horses,
        localPedigreeRelations: localTree.relations,
      };
    }),
  };
}

const LOCAL_HORSE_SELECT =
  "id,external_key,name,country,sex,sex_raw,coat,birth_year,family,chef_de_race,dosage,dosage_profile,dosage_index,center_distribution,gsv,record,earnings,summary,generation,source,source_label,source_url,created_at";

function localHorseRowToApi(horse) {
  return {
    id: horse?.id || null,
    externalKey: horse?.external_key || "",
    external_key: horse?.external_key || "",
    name: horse?.name || "",
    displayName: formatHorseDisplayName(horse),
    country: horse?.country || "",
    sex: horse?.sex || "",
    sexRaw: horse?.sex_raw || "",
    sex_raw: horse?.sex_raw || "",
    coat: horse?.coat || "",
    birthYear: horse?.birth_year || "",
    birth_year: horse?.birth_year || "",
    family: horse?.family || "",
    chefDeRace: horse?.chef_de_race || "",
    chef_de_race: horse?.chef_de_race || "",
    dosage: horse?.dosage || "",
    dosageProfile: horse?.dosage_profile || "",
    dosage_profile: horse?.dosage_profile || "",
    dosageIndex: horse?.dosage_index || "",
    dosage_index: horse?.dosage_index || "",
    centerDistribution: horse?.center_distribution || "",
    center_distribution: horse?.center_distribution || "",
    gsv: horse?.gsv || "",
    record: horse?.record || "",
    earnings: horse?.earnings || "",
    summary: horse?.summary || "",
    generation: horse?.generation || "",
    source: horse?.source || "",
    sourceLabel: horse?.source_label || "",
    source_label: horse?.source_label || "",
    sourceUrl: horse?.source_url || "",
    source_url: horse?.source_url || "",
  };
}

async function buildLocalPedigreeTreesForRows(supabase, rows, maxDepth = 5) {
  const horseRowsByKey = new Map();
  const relations = [];
  const seenRelationKeys = new Set();

  (rows || []).forEach((row) => {
    if (row?.external_key) {
      horseRowsByKey.set(row.external_key, row);
    }
  });

  let frontier = [...horseRowsByKey.keys()];
  const visitedChildren = new Set();

  for (let depth = 0; depth < maxDepth && frontier.length; depth += 1) {
    const childKeys = [...new Set(frontier)].filter(
      (key) => key && !visitedChildren.has(key)
    );

    if (!childKeys.length) break;

    childKeys.forEach((key) => visitedChildren.add(key));

    const { data: relationRows, error: relationError } = await supabase
      .from("lineage_horse_relations")
      .select("child_external_key,parent_external_key,relation_type,source")
      .in("child_external_key", childKeys)
      .in("relation_type", ["father", "mother"]);

    if (relationError) {
      throw new Error(
        `Error buscando relaciones del pedigree local: ${relationError.message}`
      );
    }

    const parentKeys = [];

    (relationRows || []).forEach((rel) => {
      const childKey = rel.child_external_key || "";
      const parentKey = rel.parent_external_key || "";
      const relationType = rel.relation_type || "";

      if (!childKey || !parentKey || !["father", "mother"].includes(relationType)) {
        return;
      }

      const relationKey = `${childKey}__${relationType}__${parentKey}`;

      if (!seenRelationKeys.has(relationKey)) {
        seenRelationKeys.add(relationKey);
        relations.push({
          childExternalKey: childKey,
          child_external_key: childKey,
          parentExternalKey: parentKey,
          parent_external_key: parentKey,
          relationType,
          relation_type: relationType,
          source: rel.source || "lineage_db",
        });
      }

      if (!horseRowsByKey.has(parentKey)) {
        parentKeys.push(parentKey);
      }
    });

    const uniqueParentKeys = [...new Set(parentKeys)].filter(Boolean);

    if (uniqueParentKeys.length) {
      const { data: parentRows, error: parentError } = await supabase
        .from("lineage_horses")
        .select(LOCAL_HORSE_SELECT)
        .in("external_key", uniqueParentKeys);

      if (parentError) {
        throw new Error(
          `Error buscando caballos relacionados en la base: ${parentError.message}`
        );
      }

      (parentRows || []).forEach((row) => {
        if (row?.external_key) {
          horseRowsByKey.set(row.external_key, row);
        }
      });
    }

    frontier = uniqueParentKeys;
  }

  const horses = [...horseRowsByKey.values()].map(localHorseRowToApi);
  const apiHorseByKey = new Map(
    horses.map((horse) => [horse.externalKey || horse.external_key, horse])
  );

  function buildNode(externalKey, depth = 0, visited = new Set()) {
    if (!externalKey || depth > maxDepth || visited.has(externalKey)) return null;

    const horse = apiHorseByKey.get(externalKey);
    if (!horse) return null;

    const nextVisited = new Set(visited);
    nextVisited.add(externalKey);

    const fatherRel = relations.find(
      (rel) =>
        (rel.childExternalKey || rel.child_external_key) === externalKey &&
        (rel.relationType || rel.relation_type) === "father"
    );

    const motherRel = relations.find(
      (rel) =>
        (rel.childExternalKey || rel.child_external_key) === externalKey &&
        (rel.relationType || rel.relation_type) === "mother"
    );

    const fatherKey = fatherRel?.parentExternalKey || fatherRel?.parent_external_key || "";
    const motherKey = motherRel?.parentExternalKey || motherRel?.parent_external_key || "";

    return {
      ...horse,
      father: buildNode(fatherKey, depth + 1, nextVisited),
      mother: buildNode(motherKey, depth + 1, nextVisited),
    };
  }

  const treesByKey = new Map();

  (rows || []).forEach((row) => {
    if (row?.external_key) {
      treesByKey.set(row.external_key, buildNode(row.external_key));
    }
  });

  return {
    horses,
    relations,
    treesByKey,
  };
}

function formatHorseDisplayName(horse) {
  const name = String(horse?.name || "").trim();
  const country = String(horse?.country || "").trim();
  const year = String(horse?.birth_year || "").trim();
  const family = cleanFamilyValue(horse?.family);

  return [
    country ? `${name} (${country})` : name,
    year || "",
    family ? `{${family}}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function normalizeSearchText(value) {
  return String(value || "")
    .replace(/[(){}[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectMissingParentSlots(rootNode, maxDepth = 5) {
  const slots = [];

  function visit(node, depth = 0) {
    if (!node || depth >= maxDepth) return;

    const childExternalKey = node.externalKey || node.external_key || "";
    const childName = node.name || "";

    if (!childExternalKey || !childName) return;

    if (!node.father) {
      slots.push({
        id: `${childExternalKey}__father`,
        childExternalKey,
        child_external_key: childExternalKey,
        childName,
        child_name: childName,
        relationType: "father",
        relation_type: "father",
        label: `Buscar padre de ${childName}`,
        placeholder: "Buscar padre en la base",
      });
    } else {
      visit(node.father, depth + 1);
    }

    if (!node.mother) {
      slots.push({
        id: `${childExternalKey}__mother`,
        childExternalKey,
        child_external_key: childExternalKey,
        childName,
        child_name: childName,
        relationType: "mother",
        relation_type: "mother",
        label: `Buscar madre de ${childName}`,
        placeholder: "Buscar madre en la base",
      });
    } else {
      visit(node.mother, depth + 1);
    }
  }

  visit(rootNode, 0);

  return slots;
}

function normalizeParentOverrides(overrides) {
  const seen = new Set();

  return (Array.isArray(overrides) ? overrides : [])
    .map((item) => {
      const childExternalKey = String(
        item?.child_external_key || item?.childExternalKey || ""
      ).trim();
      const parentExternalKey = String(
        item?.parent_external_key || item?.parentExternalKey || ""
      ).trim();
      const relationType = String(
        item?.relation_type || item?.relationType || ""
      ).trim();

      if (!childExternalKey || !parentExternalKey) return null;
      if (!["father", "mother"].includes(relationType)) return null;
      if (childExternalKey === parentExternalKey) return null;

      const key = `${childExternalKey}__${relationType}`;
      if (seen.has(key)) return null;
      seen.add(key);

      return {
        child_external_key: childExternalKey,
        parent_external_key: parentExternalKey,
        relation_type: relationType,
        source: SOURCE,
      };
    })
    .filter(Boolean);
}

function applyParentOverrides(relations, parentOverrides) {
  const overrides = normalizeParentOverrides(parentOverrides);

  if (!overrides.length) {
    return {
      relations,
      overrides,
    };
  }

  const overrideSlotKeys = new Set(
    overrides.map((rel) => `${rel.child_external_key}__${rel.relation_type}`)
  );

  const cleanRelations = (relations || []).filter((rel) => {
    const key = `${rel.child_external_key}__${rel.relation_type}`;
    return !overrideSlotKeys.has(key);
  });

  return {
    relations: normalizeImportedRelations([...cleanRelations, ...overrides]),
    overrides,
  };
}

/* =========================
   GUARDAR EN SUPABASE
========================= */

async function saveImportedPedigree(body) {
  let relations = normalizeImportedRelations(body?.relations || []);
  const rootExternalKey = String(body?.rootExternalKey || "").trim();

  const overrideResult = applyParentOverrides(relations, body?.parentOverrides || []);
  relations = overrideResult.relations;
  const parentOverrides = overrideResult.overrides;

  let horses = normalizeImportedHorses(body?.horses || []);

  horses = applyMaternalFamilyInheritance({
    horses,
    relations,
    rootExternalKey,
  });

  if (!horses.length) {
    throw new Error("No llegaron caballos para guardar.");
  }

  const supabase = getSupabaseAdmin();

  const horseKeys = [
    ...new Set(horses.map((horse) => horse.external_key)),
  ].filter(Boolean);

  const { data: existingHorseRows, error: existingHorseError } = await supabase
    .from("lineage_horses")
    .select(
      "external_key,name,country,sex,sex_raw,coat,birth_year,family,chef_de_race,dosage,dosage_profile,dosage_index,center_distribution,gsv,record,earnings,summary,generation,source,source_label,source_url"
    )
    .in("external_key", horseKeys);

  if (existingHorseError) {
    throw new Error(
      `Error consultando caballos existentes: ${existingHorseError.message}`
    );
  }

  const existingHorseByKey = new Map(
    (existingHorseRows || [])
      .filter((row) => row?.external_key)
      .map((row) => [row.external_key, row])
  );

  const existingHorseKeys = new Set(existingHorseByKey.keys());

  const horsesToInsert = horses.filter(
    (horse) => horse.external_key && !existingHorseKeys.has(horse.external_key)
  );

  if (horsesToInsert.length) {
    const { error: insertHorseError } = await supabase
      .from("lineage_horses")
      .insert(horsesToInsert);

    if (insertHorseError) {
      throw new Error(`Error creando caballos: ${insertHorseError.message}`);
    }
  }

  const horsesToUpdate = horses
    .filter((horse) => horse.external_key && existingHorseKeys.has(horse.external_key))
    .map((horse) => {
      const existing = existingHorseByKey.get(horse.external_key) || {};
      const patch = buildHorseUpdatePatch(existing, horse);

      return Object.keys(patch).length
        ? {
            external_key: horse.external_key,
            patch,
          }
        : null;
    })
    .filter(Boolean);

  for (const item of horsesToUpdate) {
    const { error: updateHorseError } = await supabase
      .from("lineage_horses")
      .update(item.patch)
      .eq("external_key", item.external_key);

    if (updateHorseError) {
      throw new Error(
        `Error actualizando caballo existente: ${updateHorseError.message}`
      );
    }
  }

  if (parentOverrides.length) {
    for (const override of parentOverrides) {
      const { error: deleteOverrideRelationError } = await supabase
        .from("lineage_horse_relations")
        .delete()
        .eq("child_external_key", override.child_external_key)
        .eq("relation_type", override.relation_type);

      if (deleteOverrideRelationError) {
        throw new Error(
          `Error reemplazando ${override.relation_type}: ${deleteOverrideRelationError.message}`
        );
      }
    }
  }

  const relationKeys = relations.map((rel) => relationDbKey(rel));
  let existingRelationKeys = new Set();

  if (relations.length) {
    const childKeys = [
      ...new Set(relations.map((rel) => rel.child_external_key)),
    ].filter(Boolean);

    const { data: existingRelationRows, error: existingRelationError } =
      await supabase
        .from("lineage_horse_relations")
        .select("child_external_key,parent_external_key,relation_type")
        .in("child_external_key", childKeys);

    if (existingRelationError) {
      throw new Error(
        `Error consultando relaciones existentes: ${existingRelationError.message}`
      );
    }

    existingRelationKeys = new Set(
      (existingRelationRows || []).map((rel) => relationDbKey(rel))
    );
  }

  const relationsToInsert = relations.filter(
    (rel, index) =>
      relationKeys[index] && !existingRelationKeys.has(relationKeys[index])
  );

  if (relationsToInsert.length) {
    const { error: insertRelationError } = await supabase
      .from("lineage_horse_relations")
      .insert(relationsToInsert);

    if (insertRelationError) {
      throw new Error(`Error creando relaciones: ${insertRelationError.message}`);
    }
  }

  return {
    ok: true,
    rootExternalKey,
    totalHorsesDetected: horses.length,
    createdHorses: horsesToInsert.length,
    updatedHorses: horsesToUpdate.length,
    existingHorses: existingHorseKeys.size,
    totalRelationsDetected: relations.length,
    createdRelations: relationsToInsert.length,
    existingRelations: existingRelationKeys.size,
    parentOverridesApplied: parentOverrides.length,
    modal: {
      title: "Caballo importado correctamente",
      message: "La importación se guardó en Lineage.",
      actions: [
        { id: "importAnother", label: "Importar otro" },
        {
          id: "goToList",
          label: "Ir al listado",
          href: "/paneladmin/blood-races/caballos",
        },
      ],
    },
  };
}

function buildHorseUpdatePatch(existing, imported) {
  const patch = {};

  const textFields = [
    "name",
    "country",
    "sex",
    "sex_raw",
    "coat",
    "birth_year",
    "family",
    "chef_de_race",
    "dosage",
    "dosage_profile",
    "record",
    "earnings",
    "summary",
    "generation",
    "source",
    "source_label",
    "source_url",
  ];

  textFields.forEach((field) => {
    const incoming =
      field === "family"
        ? cleanFamilyValue(imported?.[field])
        : cleanNullable(imported?.[field]);

    if (!incoming) return;

    const current =
      field === "family"
        ? cleanFamilyValue(existing?.[field])
        : cleanNullable(existing?.[field]);

    if (!current) {
      patch[field] = incoming;
      return;
    }

    if (field === "coat" && !isValidCoatValue(current) && isValidCoatValue(incoming)) {
      patch[field] = incoming;
    }

    if (field === "sex" && !isValidSexValue(current) && isValidSexValue(incoming)) {
      patch[field] = incoming;
    }
  });

  const numericFields = ["dosage_index", "center_distribution", "gsv"];

  numericFields.forEach((field) => {
    const incoming = cleanNumericNullable(imported?.[field]);
    if (incoming === null) return;

    const current = cleanNumericNullable(existing?.[field]);

    if (current === null) {
      patch[field] = incoming;
    }
  });

  return patch;
}

function isValidCoatValue(value) {
  return ["ZAINO", "ALAZAN", "TORDILLO"].includes(
    String(value || "").toUpperCase().trim()
  );
}

function isValidSexValue(value) {
  return ["MACHO", "HEMBRA", "CASTRADO"].includes(
    String(value || "").toUpperCase().trim()
  );
}

function applyMaternalFamilyInheritance({ horses, relations, rootExternalKey }) {
  const horseMap = new Map();

  (horses || []).forEach((horse) => {
    if (!horse?.external_key) return;
    horseMap.set(horse.external_key, { ...horse });
  });

  const motherByChild = new Map();

  (relations || []).forEach((rel) => {
    if (
      rel?.relation_type === "mother" &&
      rel?.child_external_key &&
      rel?.parent_external_key
    ) {
      motherByChild.set(rel.child_external_key, rel.parent_external_key);
    }
  });

  const rootHorse = horseMap.get(rootExternalKey);
  const rootFamily = cleanFamilyValue(rootHorse?.family);

  if (!rootFamily) {
    return horses;
  }

  let currentChildKey = rootExternalKey;
  const visited = new Set();

  while (currentChildKey && !visited.has(currentChildKey)) {
    visited.add(currentChildKey);

    const motherKey = motherByChild.get(currentChildKey);

    if (!motherKey) break;

    const mother = horseMap.get(motherKey);

    if (mother) {
      horseMap.set(motherKey, {
        ...mother,
        family: cleanFamilyValue(mother.family) || rootFamily,
      });
    }

    currentChildKey = motherKey;
  }

  return Array.from(horseMap.values());
}

function extractFamilyFromText(value) {
  const text = String(value || "");

  const match = text.match(/\{\s*([0-9]{1,2}[a-z]?(?:-[a-z0-9]+)?|A[0-9]+|C[0-9]+)\s*\}/i);

  return cleanFamilyValue(match?.[1] || "");
}

function cleanFamilyValue(value) {
  const clean = String(value || "")
    .replace(/[{}]/g, "")
    .trim();

  if (!clean) return "";

  if (clean.includes(":")) return "";
  if (clean.includes(";")) return "";
  if (/background|font|border|padding|margin|color|style|text-decoration|white-space/i.test(clean)) {
    return "";
  }

  const familyMatch = clean.match(/^(?:[0-9]{1,2}[a-z]?(?:-[a-z0-9]+)?|A[0-9]+|C[0-9]+)$/i);

  return familyMatch ? clean.toLowerCase() : "";
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan variables de Supabase. Agregá NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local y reiniciá npm run dev."
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function normalizeImportedHorses(horses) {
  const seen = new Set();

  return (Array.isArray(horses) ? horses : [])
    .map((horse) => {
      const externalKey = String(
        horse?.external_key || horse?.externalKey || ""
      ).trim();

      const name = normalizeHorseName(horse?.name || "");

      if (!externalKey || !name) return null;
      if (seen.has(externalKey)) return null;

      seen.add(externalKey);

      return {
        external_key: externalKey,
        name,
        country: cleanNullable(horse?.country),
        sex: cleanNullable(horse?.sex),
        sex_raw: cleanNullable(horse?.sex_raw || horse?.sexRaw),
        coat: cleanNullable(horse?.coat),
        birth_year: cleanNullable(horse?.birth_year || horse?.birthYear),
        family: cleanNullable(cleanFamilyValue(horse?.family)),
        chef_de_race: cleanNullable(
          String(horse?.chef_de_race || horse?.chefDeRace || "").replace(
            /[\[\]]/g,
            ""
          )
        ),
        dosage: cleanNullable(horse?.dosage),
        dosage_profile: cleanNullable(horse?.dosage_profile || horse?.dosageProfile),
        dosage_index: cleanNumericNullable(horse?.dosage_index || horse?.dosageIndex),
        center_distribution: cleanNumericNullable(
          horse?.center_distribution || horse?.centerDistribution
        ),
        gsv: cleanNumericNullable(horse?.gsv),
        record: cleanNullable(horse?.record),
        earnings: cleanNullable(horse?.earnings),
        summary: cleanNullable(horse?.summary),
        generation: cleanNullable(horse?.generation),
        source: cleanNullable(horse?.source || SOURCE),
        source_label: cleanNullable(
          horse?.source_label || horse?.sourceLabel || SOURCE_LABEL
        ),
        source_url: cleanNullable(horse?.source_url || horse?.sourceUrl),
      };
    })
    .filter(Boolean);
}

function normalizeImportedRelations(relations) {
  const seen = new Set();

  return (Array.isArray(relations) ? relations : [])
    .map((rel) => {
      const childExternalKey = String(
        rel?.child_external_key || rel?.childExternalKey || ""
      ).trim();

      const parentExternalKey = String(
        rel?.parent_external_key || rel?.parentExternalKey || ""
      ).trim();

      const relationType = String(
        rel?.relation_type || rel?.relationType || ""
      ).trim();

      if (!childExternalKey || !parentExternalKey || !relationType) return null;
      if (childExternalKey === parentExternalKey) return null;
      if (!["father", "mother"].includes(relationType)) return null;

      const key = `${childExternalKey}__${relationType}__${parentExternalKey}`;

      if (seen.has(key)) return null;

      seen.add(key);

      return {
        child_external_key: childExternalKey,
        parent_external_key: parentExternalKey,
        relation_type: relationType,
        source: SOURCE,
      };
    })
    .filter(Boolean);
}

function relationDbKey(rel) {
  return `${rel?.child_external_key || ""}__${rel?.relation_type || ""}__${
    rel?.parent_external_key || ""
  }`;
}

function cleanNullable(value) {
  const clean = String(value ?? "").trim();
  return clean || null;
}

function cleanNumericNullable(value) {
  const clean = String(value ?? "").trim();

  if (!clean) return null;

  const numeric = Number(clean);

  return Number.isFinite(numeric) ? numeric : null;
}

/* =========================
   TEXT HELPERS
========================= */

function htmlMatch(html, regex) {
  const match = String(html || "").match(regex);
  return match?.[1] || "";
}

function attrValue(attrs, name) {
  const regex = new RegExp(`${name}\\s*=\\s*["']?([^"'>\\s]+)["']?`, "i");
  return String(attrs || "").match(regex)?.[1] || "";
}

function cleanText(value) {
  return decodeHtml(String(value || ""))
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#039;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&rsquo;/gi, "’")
    .replace(/&lsquo;/gi, "‘")
    .replace(/&ndash;/gi, "-")
    .replace(/&mdash;/gi, "-")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}