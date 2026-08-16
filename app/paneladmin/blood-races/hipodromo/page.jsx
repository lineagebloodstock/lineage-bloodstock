"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLineageLanguage } from "../../../components/use-lineage-language";

const TEXT = {
  es: {
    title: "Hipódromos",
    subtitle:
      "Listado de hipódromos importados. Buscar, filtrar por país, superficie y fuente.",
    back: "Volver",
    import: "Importar hipódromo",
    search: "Buscar hipódromo",
    country: "País",
    surface: "Superficie",
    source: "Fuente",
    all: "Todos",
    name: "Nombre",
    city: "Ciudad",
    countryColumn: "País",
    surfaces: "Superficies",
    noItems: "Todavía no hay hipódromos cargados.",
  },
  pt: {
    title: "Hipódromos",
    subtitle:
      "Lista de hipódromos importados. Buscar, filtrar por país, superfície e fonte.",
    back: "Voltar",
    import: "Importar hipódromo",
    search: "Buscar hipódromo",
    country: "País",
    surface: "Superfície",
    source: "Fonte",
    all: "Todos",
    name: "Nome",
    city: "Cidade",
    countryColumn: "País",
    surfaces: "Superfícies",
    noItems: "Ainda não há hipódromos carregados.",
  },
  en: {
    title: "Racetracks",
    subtitle:
      "Imported racetracks list. Search, filter by country, surface and source.",
    back: "Back",
    import: "Import racetrack",
    search: "Search racetrack",
    country: "Country",
    surface: "Surface",
    source: "Source",
    all: "All",
    name: "Name",
    city: "City",
    countryColumn: "Country",
    surfaces: "Surfaces",
    noItems: "No racetracks loaded yet.",
  },
};

const DEMO_DATA = [];

export default function HipodromoAdminPage() {
  const { language } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [surface, setSurface] = useState("all");
  const [source, setSource] = useState("all");

  const filtered = useMemo(() => {
    return DEMO_DATA.filter((item) => {
      const q = search.toLowerCase().trim();
      const surfaces = Array.isArray(item.surfaces) ? item.surfaces : [];

      return (
        (!q || String(item.name || "").toLowerCase().includes(q)) &&
        (country === "all" || item.country === country) &&
        (surface === "all" || surfaces.includes(surface)) &&
        (source === "all" || item.source === source)
      );
    });
  }, [search, country, surface, source]);

  return (
    <AdminListLayout
      title={t.title}
      subtitle={t.subtitle}
      backLabel={t.back}
      importLabel={t.import}
      importHref="/paneladmin/blood-races/hipodromo/importar"
      searchLabel={t.search}
      search={search}
      setSearch={setSearch}
      filters={
        <>
          <SelectFilter label={t.country} value={country} onChange={setCountry}>
            <option value="all">{t.all}</option>
            <option value="ARG">Argentina</option>
            <option value="URU">Uruguay</option>
            <option value="BRZ">Brasil</option>
            <option value="USA">USA</option>
            <option value="GB">GB</option>
            <option value="IRE">Ireland</option>
            <option value="FR">France</option>
            <option value="UAE">UAE</option>
          </SelectFilter>

          <SelectFilter label={t.surface} value={surface} onChange={setSurface}>
            <option value="all">{t.all}</option>
            <option value="turf">Turf</option>
            <option value="dirt">Dirt</option>
            <option value="synthetic">Synthetic</option>
          </SelectFilter>

          <SelectFilter label={t.source} value={source} onChange={setSource}>
            <option value="all">{t.all}</option>
            <option value="emirates_racing">Emirates Racing</option>
            <option value="stud_book_argentino">Stud Book Argentino</option>
            <option value="manual">Manual</option>
          </SelectFilter>
        </>
      }
    >
      <Table
        empty={t.noItems}
        items={filtered}
        headers={[t.name, t.city, t.countryColumn, t.surfaces, t.source]}
        renderRow={(item) => (
          <>
            <Td strong>{item.name}</Td>
            <Td>{item.city}</Td>
            <Td>{item.country}</Td>
            <Td>{Array.isArray(item.surfaces) ? item.surfaces.join(", ") : ""}</Td>
            <Td>{item.source}</Td>
          </>
        )}
      />
    </AdminListLayout>
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
  filters,
  children,
}) {
  return (
    <main className="min-h-screen bg-[#f8f1e5] px-5 py-10 text-[#2b140f]">
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
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
                {searchLabel}
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full border border-[#8b0d0d] bg-white px-3 py-3 text-sm text-[#2b140f] outline-none"
              />
            </label>

            {filters}
          </div>
        </div>

        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}

function SelectFilter({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-[#8b0d0d] bg-white px-3 py-3 text-sm text-[#2b140f] outline-none"
      >
        {children}
      </select>
    </label>
  );
}

function Table({ items, headers, renderRow, empty }) {
  if (!items.length) {
    return (
      <p className="border border-[#8b0d0d] bg-[#fffaf1] p-5 text-sm font-semibold text-[#8b0d0d]">
        {empty}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#8b0d0d] bg-[#fffaf1]">
      <table className="min-w-[760px] w-full border-collapse text-sm">
        <thead className="bg-[#8b0d0d] text-white">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.13em]">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id || index} className="border-t border-[#e5d3bd]">
              {renderRow(item)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Td({ children, strong = false }) {
  return (
    <td className="px-4 py-3 text-[#2b140f]">
      {strong ? <strong>{children || "-"}</strong> : children || "-"}
    </td>
  );
}