"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useLineageLanguage } from "../../../components/use-lineage-language";

const TEXT = {
  es: {
    title: "Caballos",
    subtitle:
      "Listado de caballos importados. Desde acá podés buscar, revisar el pedigree e ingresar a la ficha de cada caballo.",
    back: "Volver",
    import: "Importar caballo",
    refresh: "Actualizar listado",
    search: "Buscar caballo",
    country: "País",
    family: "Familia",
    groupByFamily: "Agrupar por familia",
    all: "Todos",
    noFamily: "Sin familia",
    name: "Nombre",
    sex: "Sexo",
    year: "Año",
    sire: "Padre",
    dam: "Madre",
    damsire: "Abuelo materno",
    ficha: "Ficha",
    noItems: "Todavía no hay caballos cargados.",
    loading: "Cargando caballos...",
    error: "No se pudieron cargar los caballos.",
    horses: "caballos",
    writeToFilter: "Escribir para filtrar",
    searchAs: "Buscar como",
    searchHorse: "Ejemplar",
    searchDam: "Yegua madre",
    searchSire: "Padrillo",
  },
  pt: {
    title: "Cavalos",
    subtitle:
      "Lista de cavalos importados. A partir daqui você pode buscar, revisar o pedigree e entrar na ficha de cada cavalo.",
    back: "Voltar",
    import: "Importar cavalo",
    refresh: "Atualizar lista",
    search: "Buscar cavalo",
    country: "País",
    family: "Família",
    groupByFamily: "Agrupar por família",
    all: "Todos",
    noFamily: "Sem família",
    name: "Nome",
    sex: "Sexo",
    year: "Ano",
    sire: "Pai",
    dam: "Mãe",
    damsire: "Avô materno",
    ficha: "Ficha",
    noItems: "Ainda não há cavalos carregados.",
    loading: "Carregando cavalos...",
    error: "Não foi possível carregar os cavalos.",
    horses: "cavalos",
    writeToFilter: "Escrever para filtrar",
    searchAs: "Buscar como",
    searchHorse: "Exemplar",
    searchDam: "Égua mãe",
    searchSire: "Garanhão",
  },
  en: {
    title: "Horses",
    subtitle:
      "Imported horses list. From here you can search, review pedigree data and open each horse profile.",
    back: "Back",
    import: "Import horse",
    refresh: "Refresh list",
    search: "Search horse",
    country: "Country",
    family: "Family",
    groupByFamily: "Group by family",
    all: "All",
    noFamily: "No family",
    name: "Name",
    sex: "Sex",
    year: "Year",
    sire: "Sire",
    dam: "Dam",
    damsire: "Damsire",
    ficha: "Profile",
    noItems: "No horses loaded yet.",
    loading: "Loading horses...",
    error: "Could not load horses.",
    horses: "horses",
    writeToFilter: "Type to filter",
    searchAs: "Search by",
    searchHorse: "Horse",
    searchDam: "Dam",
    searchSire: "Sire",
  },
};

const HORSE_SELECT_FIELDS =
  "id, external_key, name, country, sex, sex_raw, coat, birth_year, family, dosage, record, earnings, summary, generation, source, source_label, source_url, created_at";

const RELATION_SELECT_FIELDS =
  "id, child_external_key, parent_external_key, relation_type, source";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const TABLE_SCROLL_HEIGHT = 2450;

export default function CaballosAdminPage() {
  const { language } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;

  const [horses, setHorses] = useState([]);
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("horse");
  const [countriesFilter, setCountriesFilter] = useState([]);
  const [familiesFilter, setFamiliesFilter] = useState([]);
  const [groupByFamily, setGroupByFamily] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  useEffect(() => {
    loadHorses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHorses() {
    setLoading(true);
    setLoadError("");

    try {
      if (!supabase) {
        throw new Error(
          "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
      }

      const horseRows = await fetchAllRows({
        table: "lineage_horses",
        selectFields: HORSE_SELECT_FIELDS,
        orderBy: "created_at",
        ascending: false,
      });

      const relationRows = await fetchAllRows({
        table: "lineage_horse_relations",
        selectFields: RELATION_SELECT_FIELDS,
      });

      setHorses(horseRows);
      setRelations(relationRows);
    } catch (err) {
      setLoadError(err?.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  const horsesByKey = useMemo(() => {
    const map = new Map();

    horses.forEach((horse) => {
      if (horse.external_key) {
        map.set(horse.external_key, horse);
      }
    });

    return map;
  }, [horses]);

  const relationByChildAndType = useMemo(() => {
    const map = new Map();

    relations.forEach((rel) => {
      const childKey = rel.child_external_key;
      const parentKey = rel.parent_external_key;
      const type = rel.relation_type;

      if (!childKey || !parentKey || !type) return;
      if (type !== "father" && type !== "mother") return;

      map.set(`${childKey}__${type}`, parentKey);
    });

    return map;
  }, [relations]);

  const pedigreeNamesByHorse = useMemo(() => {
    const map = new Map();

    horses.forEach((horse) => {
      const horseKey = horse.external_key;
      if (!horseKey) return;

      const sireKey = relationByChildAndType.get(`${horseKey}__father`) || "";
      const damKey = relationByChildAndType.get(`${horseKey}__mother`) || "";
      const damsireKey = damKey
        ? relationByChildAndType.get(`${damKey}__father`) || ""
        : "";

      map.set(horseKey, {
        sire: horsesByKey.get(sireKey)?.name || "",
        dam: horsesByKey.get(damKey)?.name || "",
        damsire: horsesByKey.get(damsireKey)?.name || "",
        sireKey,
        damKey,
        damsireKey,
      });
    });

    return map;
  }, [horses, horsesByKey, relationByChildAndType]);

  const countries = useMemo(() => {
    return [...new Set(horses.map((h) => cleanPiece(h.country)).filter(Boolean))]
      .sort(sortText);
  }, [horses]);

  const families = useMemo(() => {
    return [
      ...new Set(horses.map((h) => normalizeFamily(h.family)).filter(Boolean)),
    ].sort(sortFamily);
  }, [horses]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const selectedCountries = new Set(
      countriesFilter.map((item) => String(item || "").toLowerCase().trim()),
    );
    const selectedFamilies = new Set(
      familiesFilter.map((item) => normalizeFamily(item).toLowerCase().trim()),
    );

    return horses.filter((item) => {
      const itemKey = item.external_key;
      const pedigreeInfo = pedigreeNamesByHorse.get(itemKey) || {};
      const itemCountry = String(item.country || "").toLowerCase().trim();
      const itemFamily = normalizeFamily(item.family).toLowerCase().trim();

      let searchValue = item.name || "";

      if (searchMode === "dam") {
        searchValue = pedigreeInfo.dam || "";
      }

      if (searchMode === "sire") {
        searchValue = pedigreeInfo.sire || "";
      }

      const matchesSearch =
        !q || String(searchValue || "").toLowerCase().includes(q);

      const matchesCountry =
        !selectedCountries.size || selectedCountries.has(itemCountry);

      const matchesFamily =
        !selectedFamilies.size || selectedFamilies.has(itemFamily);

      return matchesSearch && matchesCountry && matchesFamily;
    });
  }, [horses, search, searchMode, countriesFilter, familiesFilter, pedigreeNamesByHorse]);

  function getSortValue(item, key) {
    const pedigreeInfo = pedigreeNamesByHorse.get(item.external_key) || {};

    if (key === "created_at") return item.created_at || "";
    if (key === "name") return item.name || "";
    if (key === "country") return item.country || "";
    if (key === "sex") return item.sex || "";
    if (key === "birth_year") return getBirthYear(item) || "";
    if (key === "family") return normalizeFamily(item.family) || "";
    if (key === "sire") return pedigreeInfo.sire || "";
    if (key === "dam") return pedigreeInfo.dam || "";
    if (key === "damsire") return pedigreeInfo.damsire || "";
    if (key === "ficha") return item.name || "";

    return "";
  }

  const sortedItems = useMemo(() => {
    const sorted = [...filtered];

    sorted.sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);

      let result = 0;

      if (sortConfig.key === "family") {
        result = sortFamily(String(aValue || ""), String(bValue || ""));
      } else if (sortConfig.key === "created_at") {
        result =
          new Date(aValue || 0).getTime() - new Date(bValue || 0).getTime();
      } else {
        const aNumber = Number(aValue);
        const bNumber = Number(bValue);

        if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
          result = aNumber - bNumber;
        } else {
          result = String(aValue || "").localeCompare(
            String(bValue || ""),
            undefined,
            {
              numeric: true,
              sensitivity: "base",
            }
          );
        }
      }

      return sortConfig.direction === "asc" ? result : result * -1;
    });

    return sorted;
  }, [filtered, sortConfig, pedigreeNamesByHorse]);

  const uniqueSortedItems = useMemo(() => {
    const seen = new Set();

    return sortedItems.filter((item, index) => {
      const key = item.external_key || item.id || `horse-${index}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [sortedItems]);

  const groupedItems = useMemo(() => {
    const groups = new Map();

    uniqueSortedItems.forEach((item) => {
      const familyKey = normalizeFamily(item.family) || "__NO_FAMILY__";

      if (!groups.has(familyKey)) {
        groups.set(familyKey, []);
      }

      groups.get(familyKey).push(item);
    });

    const entries = [...groups.entries()];

    entries.sort((a, b) => {
      if (a[0] === "__NO_FAMILY__") return 1;
      if (b[0] === "__NO_FAMILY__") return -1;
      return sortFamily(a[0], b[0]);
    });

    return entries.map(([familyKey, items]) => ({
      familyKey,
      label: familyKey === "__NO_FAMILY__" ? t.noFamily : familyKey,
      items,
    }));
  }, [uniqueSortedItems, t.noFamily]);

  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(search.trim()) ||
      countriesFilter.length > 0 ||
      familiesFilter.length > 0
    );
  }, [search, countriesFilter, familiesFilter]);

  function handleSort(key) {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: key === "created_at" ? "desc" : "asc",
      };
    });
  }

  const columns = [
    { key: "name", label: t.name, sortable: true },
    { key: "country", label: t.country, sortable: true },
    { key: "sex", label: t.sex, sortable: true },
    { key: "birth_year", label: t.year, sortable: true },
    { key: "family", label: t.family, sortable: true },
    { key: "sire", label: t.sire, sortable: true },
    { key: "dam", label: t.dam, sortable: true },
    { key: "damsire", label: t.damsire, sortable: true },
    { key: "ficha", label: t.ficha, sortable: true },
  ];

  return (
    <AdminListLayout
      title={t.title}
      subtitle={t.subtitle}
      backLabel={t.back}
      importLabel={t.import}
      importHref="/paneladmin/blood-races/caballos/importar"
      searchLabel={t.search}
      search={search}
      setSearch={setSearch}
      searchMode={searchMode}
      setSearchMode={setSearchMode}
      searchModeLabel={t.searchAs}
      searchModeOptions={[
        { value: "horse", label: t.searchHorse },
        { value: "dam", label: t.searchDam },
        { value: "sire", label: t.searchSire },
      ]}
      groupByFamily={groupByFamily}
      setGroupByFamily={setGroupByFamily}
      groupByFamilyLabel={t.groupByFamily}
      filters={
        <>
          <MultiSelectFilter
            label={t.country}
            value={countriesFilter}
            onChange={setCountriesFilter}
            options={countries}
            allLabel={t.all}
            placeholder={t.writeToFilter}
          />

          <MultiSelectFilter
            label={t.family}
            value={familiesFilter}
            onChange={setFamiliesFilter}
            options={families}
            allLabel={t.all}
            placeholder="Ej: 1-a"
          />
        </>
      }
    >
      {loading ? (
        <MessageBox text={t.loading} />
      ) : loadError ? (
        <MessageBox text={loadError} error />
      ) : !hasActiveFilters ? (
        <MessageBox text="Escribí un nombre o elegí un filtro para desplegar los caballos." />
      ) : (
        <HorseSearchResults
          empty={t.noItems}
          items={uniqueSortedItems}
          pedigreeNamesByHorse={pedigreeNamesByHorse}
        />
      )}
    </AdminListLayout>
  );
}

async function fetchAllRows({ table, selectFields, orderBy = "", ascending = true }) {
  const pageSize = 1000;
  let from = 0;
  let allRows = [];

  while (true) {
    const to = from + pageSize - 1;

    let query = supabase.from(table).select(selectFields).range(from, to);

    if (orderBy) {
      query = query.order(orderBy, { ascending });
    }

    const { data, error } = await query;

    if (error) throw error;

    const rows = Array.isArray(data) ? data : [];
    allRows = [...allRows, ...rows];

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

function HorseSearchResults({ items, pedigreeNamesByHorse, empty }) {
  if (!items.length) {
    return <MessageBox text={empty} />;
  }

  return (
    <div className="border border-[#8b0d0d] bg-[#fffaf1]">
      <div className="grid min-w-[1080px] grid-cols-[2fr_0.65fr_0.65fr_0.65fr_0.75fr_1.25fr_1.25fr_1.25fr_0.55fr] border-b border-[#8b0d0d] bg-[#8b0d0d] px-3 py-[9px] text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
        <div>Nombre</div>
        <div>País</div>
        <div>Sexo</div>
        <div>Año</div>
        <div>Familia</div>
        <div>Padre</div>
        <div>Madre</div>
        <div>Abuelo materno</div>
        <div>Ficha</div>
      </div>

      <div className="lineage-scrollbar overflow-x-auto">
        <div className="min-w-[1080px]">
          {items.map((item, index) => {
            const pedigreeInfo = pedigreeNamesByHorse.get(item.external_key) || {};
            const horseKey = item.external_key || item.id;
            const fichaHref = `/paneladmin/blood-races/caballos/${encodeURIComponent(
              horseKey,
            )}`;

            return (
              <Link
                key={`${item.external_key || item.id || "horse"}-${index}`}
                href={fichaHref}
                className="grid grid-cols-[2fr_0.65fr_0.65fr_0.65fr_0.75fr_1.25fr_1.25fr_1.25fr_0.55fr] border-b border-[#e5d3bd] px-3 py-[9px] text-[13px] leading-snug text-[#2b140f] no-underline transition last:border-b-0 hover:bg-[#f4eadb]"
              >
                <div className="font-bold uppercase text-[#8b0d0d]">
                  {item.name || "-"}
                </div>
                <div>{item.country || "-"}</div>
                <div>{item.sex || item.sex_raw || "-"}</div>
                <div>{getBirthYear(item) || "-"}</div>
                <div>{formatFamily(item.family)}</div>
                <div>{pedigreeInfo.sire || "-"}</div>
                <div>{pedigreeInfo.dam || "-"}</div>
                <div>{pedigreeInfo.damsire || "-"}</div>
                <div>
                  <span className="inline-flex border border-[#8b0d0d] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b0d0d]">
                    Ver
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HorseRow({ item, pedigreeInfo }) {
  const horseKey = item.external_key || item.id;

  const fichaHref = `/paneladmin/blood-races/caballos/${encodeURIComponent(
    horseKey
  )}`;

  return (
    <>
      <Td strong>
        <Link
          href={fichaHref}
          className="font-bold text-[#8b0d0d] no-underline hover:underline"
        >
          {item.name}
        </Link>
      </Td>

      <Td>{item.country}</Td>
      <Td>{item.sex}</Td>
      <Td>{getBirthYear(item)}</Td>
      <Td>{formatFamily(item.family)}</Td>
      <Td>{pedigreeInfo.sire}</Td>
      <Td>{pedigreeInfo.dam}</Td>
      <Td>{pedigreeInfo.damsire}</Td>

      <Td>
        <Link
          href={fichaHref}
          className="inline-flex border border-[#8b0d0d] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b0d0d] no-underline hover:bg-[#8b0d0d] hover:text-white"
        >
          Ver
        </Link>
      </Td>
    </>
  );
}

function AdminListLayout({
  title,
  subtitle,
  backLabel,
  importLabel,
  importHref,
  searchLabel,
  search,
  setSearch,
  searchMode,
  setSearchMode,
  searchModeLabel,
  searchModeOptions,
  filters,
  groupByFamily,
  setGroupByFamily,
  groupByFamilyLabel,
  children,
}) {
  return (
    <main className="min-h-screen bg-[#f8f1e5] px-5 py-10 text-[#2b140f]">
      <style jsx global>{`
        .lineage-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #8b0d0d #fffaf1;
        }

        .lineage-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .lineage-scrollbar::-webkit-scrollbar-track {
          background: #fffaf1;
          border-left: 1px solid #e5d3bd;
          border-radius: 0 !important;
        }

        .lineage-scrollbar::-webkit-scrollbar-thumb {
          background: #8b0d0d;
          border: 0;
          border-radius: 0 !important;
          min-height: 36px;
        }

        .lineage-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6f0909;
        }

        .lineage-scrollbar::-webkit-scrollbar-corner {
          background: #fffaf1;
        }

        .lineage-scrollbar::-webkit-scrollbar-button {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>

      <section className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b0d0d]">
              Bloodstock-Carreras
            </p>

            <h1 className="text-4xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
              {title}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#6f5b50]">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/paneladmin/blood-races"
              className="border border-[#8b0d0d] bg-[#fbf6ec] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] transition hover:bg-[#8b0d0d] hover:text-white"
            >
              {backLabel}
            </Link>


            <Link
              href={importHref}
              className="border border-[#8b0d0d] bg-[#8b0d0d] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#6f0909]"
            >
              {importLabel}
            </Link>
          </div>
        </div>

        <div className="h-[2px] w-full bg-[#8b0d0d]" />

        <div className="mt-6 border border-[#e5d3bd] bg-[#fffaf1] p-4">
          <label className="block w-full md:w-1/2">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
              {searchLabel}
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full border-0 border-b border-[#8b0d0d] bg-transparent px-1 py-3 text-sm text-[#2b140f] outline-none placeholder:text-[#a58a7e]"
            />
          </label>

          <div className="mt-5 grid gap-4 md:grid-cols-[0.85fr_1fr_1fr]">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
                {searchModeLabel}
              </span>
              <select
                value={searchMode}
                onChange={(event) => setSearchMode(event.target.value)}
                className="w-full border-0 border-b border-[#8b0d0d] bg-transparent px-1 py-3 text-sm font-semibold text-[#2b140f] outline-none"
              >
                {searchModeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {filters}
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#8b0d0d]">
            <input
              type="checkbox"
              checked={groupByFamily}
              onChange={(event) => setGroupByFamily(event.target.checked)}
              className="h-4 w-4 accent-[#8b0d0d]"
            />
            {groupByFamilyLabel}
          </label>
        </div>

        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}

function MultiSelectFilter({
  label,
  value,
  onChange,
  options,
  allLabel,
  placeholder = "",
}) {
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState("");

  const selectedValues = Array.isArray(value) ? value : [];

  const visibleOptions = useMemo(() => {
    const q = String(filterText || "").toLowerCase().trim();
    const list = !q
      ? options
      : options.filter((option) => String(option).toLowerCase().includes(q));

    return list.slice(0, 80);
  }, [options, filterText]);

  function toggleOption(option) {
    const exists = selectedValues.includes(option);

    if (exists) {
      onChange(selectedValues.filter((item) => item !== option));
      return;
    }

    onChange([...selectedValues, option]);
  }

  function clearAll() {
    onChange([]);
    setFilterText("");
  }

  return (
    <label className="relative block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
        {label}
      </span>

      <div className="min-h-[43px] border-0 border-b border-[#8b0d0d] bg-transparent px-1 py-2">
        {selectedValues.length ? (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {selectedValues.map((item) => (
              <button
                key={item}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(selectedValues.filter((selected) => selected !== item));
                }}
                className="inline-flex items-center gap-1 border border-[#8b0d0d] bg-[#f8f1e5] px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#8b0d0d]"
              >
                {item}
                <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        ) : null}

        <input
          value={filterText}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120);
          }}
          onChange={(event) => {
            setFilterText(event.target.value);
            setOpen(true);
          }}
          placeholder={selectedValues.length ? "" : placeholder}
          className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-[#2b140f] outline-none placeholder:font-normal placeholder:text-[#a58a7e]"
        />
      </div>

      {selectedValues.length ? (
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            clearAll();
            setOpen(false);
          }}
          className="absolute right-1 top-[34px] text-[11px] font-black uppercase tracking-[0.12em] text-[#8b0d0d]"
        >
          ×
        </button>
      ) : null}

      {open ? (
        <div className="lineage-scrollbar absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto border border-[#8b0d0d] bg-[#fffaf1] shadow-[0_18px_30px_rgba(76,25,16,0.14)]">
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              clearAll();
              setOpen(false);
            }}
            className="block w-full border-b border-[#e5d3bd] px-3 py-2 text-left text-[11px] font-black uppercase tracking-[0.14em] text-[#8b0d0d] hover:bg-[#f4eadb]"
          >
            {allLabel}
          </button>

          {visibleOptions.length ? (
            visibleOptions.map((option) => {
              const checked = selectedValues.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    toggleOption(option);
                    setOpen(true);
                  }}
                  className={`flex w-full items-center justify-between gap-3 border-b border-[#eadccc] px-3 py-2 text-left text-sm font-semibold hover:bg-[#f4eadb] ${
                    checked ? "bg-[#f8f1e5] text-[#8b0d0d]" : "text-[#2b140f]"
                  }`}
                >
                  <span>{option}</span>
                  <span className="text-[11px] font-black text-[#8b0d0d]">
                    {checked ? "✓" : ""}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-3 text-sm font-semibold text-[#7a6258]">
              -
            </div>
          )}
        </div>
      ) : null}
    </label>
  );
}

function Table({ items, columns, renderRow, empty, sortConfig, onSort }) {
  if (!items.length) {
    return <MessageBox text={empty} />;
  }

  return (
    <div
      className="lineage-scrollbar overflow-x-auto border border-[#8b0d0d] bg-[#fffaf1]"
      style={{ maxHeight: TABLE_SCROLL_HEIGHT, overflowY: "auto" }}
    >
      <table className="min-w-[1080px] w-full border-collapse text-sm">
        <TableHead columns={columns} sortConfig={sortConfig} onSort={onSort} />

        <tbody>
          {items.map((item, index) => (
            <tr
              key={`${item.external_key || item.id || "horse"}-${index}`}
              className="border-t border-[#e5d3bd] transition hover:bg-[#f4eadb]"
            >
              {renderRow(item)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupedTable({
  groups,
  columns,
  renderRow,
  empty,
  sortConfig,
  onSort,
  horsesLabel,
}) {
  const [openGroups, setOpenGroups] = useState({});
  const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);

  if (!totalItems) {
    return <MessageBox text={empty} />;
  }

  function toggleGroup(familyKey) {
    setOpenGroups((current) => ({
      ...current,
      [familyKey]: !current[familyKey],
    }));
  }

  function openAll() {
    const next = {};
    groups.forEach((group) => {
      next[group.familyKey] = true;
    });
    setOpenGroups(next);
  }

  function closeAll() {
    setOpenGroups({});
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={openAll}
          className="border border-[#8b0d0d] bg-[#fffaf1] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#8b0d0d] transition hover:bg-[#8b0d0d] hover:text-white"
        >
          Abrir todas
        </button>

        <button
          type="button"
          onClick={closeAll}
          className="border border-[#8b0d0d] bg-[#fffaf1] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#8b0d0d] transition hover:bg-[#8b0d0d] hover:text-white"
        >
          Cerrar todas
        </button>
      </div>

      {groups.map((group) => {
        const isOpen = Boolean(openGroups[group.familyKey]);

        return (
          <section
            key={group.familyKey}
            className="border border-[#8b0d0d] bg-[#fffaf1]"
          >
            <button
              type="button"
              onClick={() => toggleGroup(group.familyKey)}
              className="flex w-full flex-wrap items-center justify-between gap-3 border-0 bg-[#f3e4cf] px-4 py-3 text-left transition hover:bg-[#ead8c0]"
            >
              <span className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center border border-[#8b0d0d] text-sm font-black leading-none text-[#8b0d0d]">
                  {isOpen ? "−" : "+"}
                </span>

                <span className="text-sm font-black uppercase tracking-[0.14em] text-[#8b0d0d]">
                  {group.label}
                </span>
              </span>

              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a6258]">
                {group.items.length} {horsesLabel}
              </span>
            </button>

            {isOpen ? (
              <div
                className="lineage-scrollbar overflow-x-auto border-t border-[#e5d3bd]"
                style={{ maxHeight: TABLE_SCROLL_HEIGHT, overflowY: "auto" }}
              >
                <table className="min-w-[1080px] w-full border-collapse text-sm">
                  <TableHead
                    columns={columns}
                    sortConfig={sortConfig}
                    onSort={onSort}
                  />

                  <tbody>
                    {group.items.map((item, index) => (
                      <tr
                        key={`${group.familyKey}-${item.external_key || item.id || "horse"}-${index}`}
                        className="border-t border-[#e5d3bd] transition hover:bg-[#f4eadb]"
                      >
                        {renderRow(item)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function TableHead({ columns, onSort }) {
  return (
    <thead className="sticky top-0 z-10 bg-[#8b0d0d] text-white">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className="px-3 py-[9px] text-left text-[10px] font-semibold uppercase tracking-[0.12em]"
          >
            {column.sortable ? (
              <button
                type="button"
                onClick={() => onSort(column.key)}
                className="w-full cursor-pointer text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:opacity-80"
              >
                {column.label}
              </button>
            ) : (
              column.label
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function Td({ children, strong = false }) {
  return (
    <td className="px-3 py-[9px] align-top text-[13px] leading-snug text-[#2b140f]">
      {strong ? <strong>{children || "-"}</strong> : children || "-"}
    </td>
  );
}

function getBirthYear(item) {
  const direct = String(item?.birth_year || item?.birthYear || "").trim();
  if (direct) return direct;

  const birthdate = String(item?.birthdate || item?.date_of_birth || "").trim();
  const year = birthdate.match(/(?:18|19|20)\d{2}/)?.[0] || "";

  return year;
}

function MessageBox({ text, error = false }) {
  return (
    <p
      className={`border p-5 text-sm font-semibold ${
        error
          ? "border-[#b91c1c] bg-[#fff0f0] text-[#8b0d0d]"
          : "border-[#8b0d0d] bg-[#fffaf1] text-[#8b0d0d]"
      }`}
    >
      {text}
    </p>
  );
}

function normalizeFamily(value) {
  return String(value || "")
    .replace(/[{}]/g, "")
    .trim();
}

function formatFamily(value) {
  const clean = normalizeFamily(value);
  return clean ? `{${clean}}` : "-";
}

function cleanPiece(value) {
  return String(value || "").trim();
}

function sortText(a, b) {
  return String(a || "").localeCompare(String(b || ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function sortFamily(a, b) {
  const cleanA = normalizeFamily(a);
  const cleanB = normalizeFamily(b);

  if (!cleanA && !cleanB) return 0;
  if (!cleanA) return 1;
  if (!cleanB) return -1;

  return cleanA.localeCompare(cleanB, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
