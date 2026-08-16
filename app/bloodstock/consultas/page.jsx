"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useLineageLanguage } from "../../components/use-lineage-language";
import BloodstockSubnav from "../components/BloodstockSubnav";

const TEXT = {
  es: {
    heroTitle: "Consultas de bloodstock.",
    heroText:
      "Buscar caballos dentro de la base oficial de Lineage Bloodstock. La información será cargada y actualizada únicamente desde el panel admin.",
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
    seeProfile: "Ver ficha",
    noItems: "No se encontraron caballos con esa búsqueda.",
    empty: "Todavía no hay caballos cargados.",
    loading: "Cargando caballos...",
    error: "No se pudieron cargar los caballos.",
    horses: "caballos",
    writeToFilter: "Escribir para filtrar",
    openAll: "Abrir todas",
    closeAll: "Cerrar todas",
    searchAs: "Buscar como",
    searchHorse: "Ejemplar",
    searchDam: "Yegua madre",
    searchSire: "Padrillo",
    startSearch: "Escribí un nombre o elegí un filtro para desplegar los caballos.",
  },
  pt: {
    heroTitle: "Consultas de bloodstock.",
    heroText:
      "Buscar cavalos dentro da base oficial da Lineage Bloodstock. A informação será carregada e atualizada somente pelo painel admin.",
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
    seeProfile: "Ver ficha",
    noItems: "Nenhum cavalo encontrado com essa busca.",
    empty: "Ainda não há cavalos carregados.",
    loading: "Carregando cavalos...",
    error: "Não foi possível carregar os cavalos.",
    horses: "cavalos",
    writeToFilter: "Escrever para filtrar",
    openAll: "Abrir todas",
    closeAll: "Fechar todas",
    searchAs: "Buscar como",
    searchHorse: "Exemplar",
    searchDam: "Égua mãe",
    searchSire: "Garanhão",
    startSearch: "Digite um nome ou escolha um filtro para mostrar os cavalos.",
  },
  en: {
    heroTitle: "Bloodstock queries.",
    heroText:
      "Search horses inside the official Lineage Bloodstock database. Information will be loaded and updated only from the admin panel.",
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
    seeProfile: "View profile",
    noItems: "No horses found with that search.",
    empty: "No horses loaded yet.",
    loading: "Loading horses...",
    error: "Could not load horses.",
    horses: "horses",
    writeToFilter: "Type to filter",
    openAll: "Open all",
    closeAll: "Close all",
    searchAs: "Search by",
    searchHorse: "Horse",
    searchDam: "Dam",
    searchSire: "Sire",
    startSearch: "Type a name or choose a filter to display horses.",
  },
};

const HORSE_SELECT_FIELDS =
  "id, external_key, name, country, sex, sex_raw, coat, birth_year, family, dosage, record, earnings, summary, generation, source, source_label, source_url, created_at";

const RELATION_SELECT_FIELDS =
  "id, child_external_key, parent_external_key, relation_type, source";

const TABLE_MAX_HEIGHT_CLASS = "max-h-[2600px]";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export default function BloodstockConsultasPage() {
  const { language } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;

  const [horses, setHorses] = useState([]);
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState("horse");
  const [countriesFilter, setCountriesFilter] = useState([]);
  const [familiesFilter, setFamiliesFilter] = useState([]);
  const [groupByFamily, setGroupByFamily] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  useEffect(() => {
    const q = search.trim();

    if (!q || hasLoaded || loading) return;

    const timer = window.setTimeout(() => {
      loadHorses();
    }, 250);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, hasLoaded, loading]);

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
        orderBy: "name",
        ascending: true,
      });

      const relationRows = await fetchAllRows({
        table: "lineage_horse_relations",
        selectFields: RELATION_SELECT_FIELDS,
      });

      setHorses(horseRows);
      setRelations(relationRows);
      setHasLoaded(true);
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
    const q = normalizeText(search);
    const selectedCountries = new Set(
      countriesFilter.map((item) => normalizeText(item))
    );
    const selectedFamilies = new Set(
      familiesFilter.map((item) => normalizeText(normalizeFamily(item)))
    );

    return horses.filter((item) => {
      const pedigreeInfo = pedigreeNamesByHorse.get(item.external_key) || {};
      const itemCountry = normalizeText(item.country);
      const itemFamily = normalizeText(normalizeFamily(item.family));

      let searchValue = item.name || "";

      if (searchMode === "dam") {
        searchValue = pedigreeInfo.dam || "";
      }

      if (searchMode === "sire") {
        searchValue = pedigreeInfo.sire || "";
      }

      const matchesSearch =
        !q || normalizeText(searchValue).includes(q);

      const matchesCountry =
        !selectedCountries.size || selectedCountries.has(itemCountry);

      const matchesFamily =
        !selectedFamilies.size || selectedFamilies.has(itemFamily);

      return matchesSearch && matchesCountry && matchesFamily;
    });
  }, [
    horses,
    search,
    searchMode,
    countriesFilter,
    familiesFilter,
    pedigreeNamesByHorse,
  ]);

  function getSortValue(item, key) {
    const pedigreeInfo = pedigreeNamesByHorse.get(item.external_key) || {};

    if (key === "name") return item.name || "";
    if (key === "country") return item.country || "";
    if (key === "sex") return item.sex || "";
    if (key === "birth_year") return item.birth_year || "";
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

  const groupedItems = useMemo(() => {
    const groups = new Map();

    sortedItems.forEach((item) => {
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
  }, [sortedItems, t.noFamily]);

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
        direction: "asc",
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
    { key: "ficha", label: t.ficha, sortable: false },
  ];

  const emptyText = horses.length ? t.noItems : t.empty;

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
        <div className="border border-[#e5d3bd] bg-[#fffaf1] p-4">
          <label className="block w-full md:w-1/2">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
              {t.search}
            </span>
            <div className="flex items-center gap-3 border-b border-[#8b0d0d]">
              <SearchIcon />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent px-1 py-3 text-sm font-semibold text-[#2b140f] outline-none placeholder:text-[#a58a7e]"
              />
            </div>
          </label>

          <div className="mt-5 grid gap-4 md:grid-cols-[0.85fr_1fr_1fr]">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
                {t.searchAs}
              </span>
              <select
                value={searchMode}
                onChange={(event) => setSearchMode(event.target.value)}
                className="w-full border-0 border-b border-[#8b0d0d] bg-transparent px-1 py-3 text-sm font-semibold text-[#2b140f] outline-none"
              >
                <option value="horse">{t.searchHorse}</option>
                <option value="dam">{t.searchDam}</option>
                <option value="sire">{t.searchSire}</option>
              </select>
            </label>

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
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#8b0d0d]">
            <input
              type="checkbox"
              checked={groupByFamily}
              onChange={(event) => setGroupByFamily(event.target.checked)}
              className="h-4 w-4 accent-[#8b0d0d]"
            />
            {t.groupByFamily}
          </label>
        </div>

        <div className="mt-6">
          {loading ? null : loadError ? (
            <MessageBox text={loadError} error />
          ) : !hasActiveFilters ? (
            <MessageBox text={t.startSearch} />
          ) : groupByFamily ? (
            <GroupedTable
              empty={emptyText}
              groups={groupedItems}
              columns={columns}
              sortConfig={sortConfig}
              onSort={handleSort}
              renderRow={(item) => (
                <HorseRow
                  item={item}
                  pedigreeInfo={pedigreeNamesByHorse.get(item.external_key) || {}}
                  seeProfileLabel={t.seeProfile}
                />
              )}
              horsesLabel={t.horses}
              openAllLabel={t.openAll}
              closeAllLabel={t.closeAll}
            />
          ) : (
            <Table
              empty={emptyText}
              items={sortedItems}
              columns={columns}
              sortConfig={sortConfig}
              onSort={handleSort}
              renderRow={(item) => (
                <HorseRow
                  item={item}
                  pedigreeInfo={pedigreeNamesByHorse.get(item.external_key) || {}}
                  seeProfileLabel={t.seeProfile}
                />
              )}
            />
          )}
        </div>
      </section>
    </main>
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

function HorseRow({ item, pedigreeInfo, seeProfileLabel }) {
  const horseKey = item.external_key || item.id;
  const fichaHref = `/bloodstock/consultas/${encodeURIComponent(horseKey)}`;

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
      <Td>{item.birth_year}</Td>
      <Td>{formatFamily(item.family)}</Td>
      <Td>{pedigreeInfo.sire}</Td>
      <Td>{pedigreeInfo.dam}</Td>
      <Td>{pedigreeInfo.damsire}</Td>

      <Td>
        <Link
          href={fichaHref}
          className="inline-flex border border-[#8b0d0d] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] no-underline hover:bg-[#8b0d0d] hover:text-white"
        >
          {seeProfileLabel}
        </Link>
      </Td>
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-[#8b0d0d]"
    >
      <path
        d="M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Zm5.2-1.9 4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
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
    const q = normalizeText(filterText);
    const list = !q
      ? options
      : options.filter((option) => normalizeText(option).includes(q));

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
                  onChange(
                    selectedValues.filter((selected) => selected !== item)
                  );
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
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto border border-[#8b0d0d] bg-[#fffaf1] shadow-[0_18px_30px_rgba(76,25,16,0.14)]">
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
                    checked
                      ? "bg-[#f8f1e5] text-[#8b0d0d]"
                      : "text-[#2b140f]"
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
      className={`overflow-auto border border-[#8b0d0d] bg-[#fffaf1] ${TABLE_MAX_HEIGHT_CLASS}`}
    >
      <table className="min-w-[1080px] w-full border-collapse text-sm">
        <TableHead columns={columns} sortConfig={sortConfig} onSort={onSort} />

        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id || item.external_key || index}
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
  openAllLabel,
  closeAllLabel,
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
          {openAllLabel}
        </button>

        <button
          type="button"
          onClick={closeAll}
          className="border border-[#8b0d0d] bg-[#fffaf1] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#8b0d0d] transition hover:bg-[#8b0d0d] hover:text-white"
        >
          {closeAllLabel}
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
                className={`overflow-auto border-t border-[#e5d3bd] ${TABLE_MAX_HEIGHT_CLASS}`}
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
                        key={item.id || item.external_key || index}
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
    <thead className="sticky top-0 z-20 bg-[#8b0d0d] text-white">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.13em]"
          >
            {column.sortable ? (
              <button
                type="button"
                onClick={() => onSort(column.key)}
                className="w-full cursor-pointer text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-white transition hover:opacity-80"
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
    <td className="px-4 py-3 align-top text-[#2b140f]">
      {strong ? <strong>{children || "-"}</strong> : children || "-"}
    </td>
  );
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

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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
