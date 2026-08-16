"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const COLORS = {
  wine: "#8B0E0E",
  cream: "#F8F1E5",
  cream2: "#FFF9EF",
  white: "#FFFFFF",
  text: "#2B1A14",
  muted: "#7A6258",
  border: "#E7D7C4",
  male: "#F1ECE6",
  female: "#F7E1D1",
};

const COUNTRY_OPTIONS = [
  { value: "", label: "Sin país" },
  { value: "ARG", label: "ARG" },
  { value: "URU", label: "URU" },
  { value: "BRZ", label: "BRZ" },
  { value: "USA", label: "USA" },
  { value: "GB", label: "GB" },
  { value: "IRE", label: "IRE" },
  { value: "FR", label: "FR" },
  { value: "CHI", label: "CHI" },
  { value: "PER", label: "PER" },
  { value: "JPN", label: "JPN" },
  { value: "AUS", label: "AUS" },
  { value: "NZ", label: "NZ" },
  { value: "SAF", label: "SAF" },
  { value: "GER", label: "GER" },
  { value: "ITY", label: "ITY" },
  { value: "SPA", label: "SPA" },
  { value: "CAN", label: "CAN" },
];

const SEX_OPTIONS = [
  { value: "", label: "Sin sexo" },
  { value: "HEMBRA", label: "Hembra" },
  { value: "MACHO", label: "Macho" },
  { value: "CASTRADO", label: "Castrado" },
];

const COAT_OPTIONS = [
  { value: "", label: "Sin pelo" },
  { value: "ALAZAN", label: "Alazán" },
  { value: "ZAINO", label: "Zaino" },
  { value: "TORDILLO", label: "Tordillo" },
];

const FAMILY_OPTIONS = [
  "1",
  "1-a",
  "1-b",
  "1-c",
  "1-d",
  "1-e",
  "1-f",
  "1-g",
  "1-h",
  "1-i",
  "1-k",
  "2",
  "2-a",
  "2-b",
  "2-c",
  "2-d",
  "2-e",
  "2-f",
  "2-g",
  "2-h",
  "2-i",
  "2-n",
  "3",
  "3-a",
  "3-b",
  "3-c",
  "3-d",
  "3-e",
  "3-f",
  "3-l",
  "3-n",
  "3-o",
  "4",
  "4-a",
  "4-b",
  "4-c",
  "4-d",
  "4-e",
  "4-f",
  "4-g",
  "4-k",
  "4-m",
  "4-n",
  "4-r",
  "5",
  "5-a",
  "5-b",
  "5-c",
  "5-d",
  "5-e",
  "5-f",
  "5-g",
  "5-h",
  "5-i",
  "5-j",
  "6",
  "6-a",
  "6-b",
  "6-c",
  "6-d",
  "6-e",
  "6-f",
  "6-x",
  "7",
  "7-a",
  "7-b",
  "7-c",
  "7-d",
  "7-e",
  "7-f",
  "8",
  "8-a",
  "8-b",
  "8-c",
  "8-d",
  "8-f",
  "8-g",
  "8-h",
  "8-i",
  "8-k",
  "9",
  "9-a",
  "9-b",
  "9-c",
  "9-e",
  "9-f",
  "9-g",
  "9-h",
  "10",
  "10-a",
  "10-b",
  "10-c",
  "10-d",
  "10-e",
  "11",
  "11-a",
  "11-b",
  "11-c",
  "11-d",
  "11-e",
  "11-f",
  "11-g",
  "12",
  "12-a",
  "12-b",
  "12-c",
  "12-d",
  "12-e",
  "13",
  "13-a",
  "13-b",
  "13-c",
  "13-d",
  "13-e",
  "14",
  "14-a",
  "14-b",
  "14-c",
  "14-f",
  "16",
  "16-a",
  "16-b",
  "16-c",
  "16-d",
  "16-e",
  "16-g",
  "16-h",
  "19",
  "19-a",
  "19-b",
  "19-c",
  "19-d",
  "20",
  "20-a",
  "20-b",
  "20-c",
  "21",
  "22",
  "23",
  "26",
  "A1",
  "A4",
  "A5",
  "C1",
];

const TABS = [
  { key: "pedigree", label: "Pedigree" },
  { key: "progeny", label: "Progeny" },
  { key: "siblings", label: "Siblings" },
  { key: "hypo_mating", label: "Hypo Mating" },
  { key: "female_family", label: "Female Family" },
  { key: "tail_female", label: "Tail Female" },
  { key: "linebreeding", label: "Linebreeding" },
  { key: "inbreeding", label: "Inbreeding" },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export default function CaballoAdminFichaPage() {
  const params = useParams();
  const externalKey = decodeURIComponent(String(params?.id || ""));

  const [horse, setHorse] = useState(null);
  const [horses, setHorses] = useState([]);
  const [relations, setRelations] = useState([]);
  const [activeTab, setActiveTab] = useState("pedigree");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(getEmptyHorseForm());
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedFemaleFamilyKey, setSelectedFemaleFamilyKey] = useState("");

  useEffect(() => {
    loadHorse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalKey]);

  async function loadHorse() {
    setLoading(true);
    setError("");

    try {
      if (!supabase) {
        throw new Error(
          "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        );
      }

      const selectFields =
        "id, external_key, name, country, sex, sex_raw, coat, birth_year, family, dosage, record, earnings, summary, generation, source, source_label, source_url, created_at";

      const { data: horseRow, error: horseError } = await supabase
        .from("lineage_horses")
        .select(selectFields)
        .eq("external_key", externalKey)
        .maybeSingle();

      if (horseError) throw horseError;
      if (!horseRow) throw new Error("No se encontró el caballo.");

      const horseRows = await fetchAllRows("lineage_horses", selectFields);
      const relationRows = await fetchAllRows(
        "lineage_horse_relations",
        "id, child_external_key, parent_external_key, relation_type, source, created_at",
      );

      const horsesMap = new Map();

      horseRows.forEach((item) => {
        if (item?.external_key) {
          horsesMap.set(item.external_key, item);
        }
      });

      if (horseRow?.external_key) {
        horsesMap.set(horseRow.external_key, horseRow);
      }

      setHorse(horseRow);
      setEditForm(horseToForm(horseRow));
      setIsEditing(false);
      setSaveMessage("");
      setHorses([...horsesMap.values()]);
      setRelations(Array.isArray(relationRows) ? relationRows : []);
    } catch (err) {
      setError(err?.message || "Error cargando ficha del caballo.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllRows(table, selectFields) {
    const pageSize = 1000;
    let from = 0;
    let allRows = [];

    while (true) {
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from(table)
        .select(selectFields)
        .range(from, to);

      if (error) throw error;

      const rows = Array.isArray(data) ? data : [];
      allRows = [...allRows, ...rows];

      if (rows.length < pageSize) break;

      from += pageSize;
    }

    return allRows;
  }

  function startEditing() {
    setEditForm(horseToForm(horse));
    setSaveMessage("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setEditForm(horseToForm(horse));
    setSaveMessage("");
    setIsEditing(false);
  }

  function updateEditField(field, value) {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveHorseChanges() {
    if (!supabase || !horse?.external_key) return;

    setSaving(true);
    setSaveMessage("");

    try {
      const payload = formToHorsePayload(editForm);

      const { data, error: updateError } = await supabase
        .from("lineage_horses")
        .update(payload)
        .eq("external_key", horse.external_key)
        .select(
          "id, external_key, name, country, sex, sex_raw, coat, birth_year, family, dosage, record, earnings, summary, generation, source, source_label, source_url, created_at",
        )
        .maybeSingle();

      if (updateError) throw updateError;
      if (!data) throw new Error("No se pudo guardar la ficha.");

      setHorse(data);
      setEditForm(horseToForm(data));
      setHorses((current) =>
        current.map((item) =>
          item.external_key === data.external_key ? { ...item, ...data } : item,
        ),
      );
      setIsEditing(false);
      setSaveMessage("Cambios guardados correctamente.");
    } catch (err) {
      setSaveMessage(err?.message || "Error guardando cambios.");
    } finally {
      setSaving(false);
    }
  }

  const horsesByKey = useMemo(() => {
    const map = new Map();

    horses.forEach((item) => {
      if (item.external_key) {
        map.set(item.external_key, item);
      }
    });

    return map;
  }, [horses]);

  useEffect(() => {
    if (!horse?.external_key || !horsesByKey.size) return;

    const currentSelected = selectedFemaleFamilyKey
      ? horsesByKey.get(selectedFemaleFamilyKey)
      : null;

    if (currentSelected && isFemaleHorse(currentSelected)) return;

    const defaultMare = isFemaleHorse(horse)
      ? horse
      : getMotherForHorse(horse, horsesByKey, relations);

    setSelectedFemaleFamilyKey(defaultMare?.external_key || "");
  }, [horse, horsesByKey, relations, selectedFemaleFamilyKey]);

  const pedigree = useMemo(() => {
    if (!horse?.external_key) return null;

    return buildPedigreeTree({
      rootExternalKey: horse.external_key,
      horsesByKey,
      relations,
      maxDepth: 5,
    });
  }, [horse, horsesByKey, relations]);

  const horseRelations = useMemo(() => {
    if (!horse?.external_key) {
      return {
        progeny: [],
        siblings: [],
      };
    }

    const damRel = relations.find(
      (rel) =>
        rel.child_external_key === horse.external_key &&
        rel.relation_type === "mother",
    );

    const dam = damRel ? horsesByKey.get(damRel.parent_external_key) : null;

    const progeny = relations
      .filter((rel) => rel.parent_external_key === horse.external_key)
      .map((rel) => horsesByKey.get(rel.child_external_key))
      .filter(Boolean)
      .sort(sortByBirthYearFirst);

    const siblings = dam
      ? relations
          .filter(
            (rel) =>
              rel.parent_external_key === dam.external_key &&
              rel.relation_type === "mother" &&
              rel.child_external_key !== horse.external_key,
          )
          .map((rel) => horsesByKey.get(rel.child_external_key))
          .filter(Boolean)
          .sort(sortByBirthYearFirst)
      : [];

    return {
      progeny,
      siblings,
    };
  }, [horse, horsesByKey, relations]);

  const femaleMares = useMemo(() => {
    if (!horse?.external_key) return [];

    return getRelatedFemaleMaresForHorse({
      horse,
      horsesByKey,
      relations,
    });
  }, [horse, horsesByKey, relations]);

  const femaleFamilyTree = useMemo(() => {
    if (!selectedFemaleFamilyKey) return null;

    return buildFemaleFamilyTree({
      rootExternalKey: selectedFemaleFamilyKey,
      horsesByKey,
      relations,
      maxDepth: 12,
    });
  }, [selectedFemaleFamilyKey, horsesByKey, relations]);

  const tailFemaleLine = useMemo(() => {
    if (!horse?.external_key) return [];

    return buildTailFemaleLine({
      rootExternalKey: horse.external_key,
      horsesByKey,
      relations,
      maxDepth: 80,
    });
  }, [horse, horsesByKey, relations]);

  const linebreedingRows = useMemo(() => {
    if (!horse?.external_key) return [];

    return buildLinebreedingRows({
      rootExternalKey: horse.external_key,
      horsesByKey,
      relations,
      maxGeneration: 9,
    });
  }, [horse, horsesByKey, relations]);

  const inbreedingRows = useMemo(() => {
    if (!horse?.external_key) return [];

    return buildInbreedingRows({
      rootExternalKey: horse.external_key,
      horsesByKey,
      relations,
      maxGeneration: 5,
    });
  }, [horse, horsesByKey, relations]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f1e5] px-5 py-10 text-[#2b140f]">
        <section className="mx-auto max-w-7xl">
          <MessageBox text="Cargando ficha del caballo..." />
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f8f1e5] px-5 py-10 text-[#2b140f]">
        <section className="mx-auto max-w-7xl">
          <Link
            href="/paneladmin/blood-races/caballos"
            className="mb-5 inline-flex border border-[#8b0d0d] bg-[#fbf6ec] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] no-underline"
          >
            Volver a caballos
          </Link>

          <MessageBox text={error} error />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f1e5] px-5 py-10 text-[#2b140f]">
      <section className="mx-auto max-w-7xl">
        <header className="mb-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/paneladmin/blood-races/caballos"
              className="inline-flex border border-[#8b0d0d] bg-[#fbf6ec] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] no-underline transition hover:bg-[#8b0d0d] hover:text-white"
            >
              Volver a caballos
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    className="inline-flex border border-[#8b0d0d] bg-[#fffaf1] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] transition hover:bg-[#f4eadb] disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={saveHorseChanges}
                    disabled={saving}
                    className="inline-flex border border-[#8b0d0d] bg-[#8b0d0d] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#6f0808] disabled:opacity-60"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startEditing}
                  className="inline-flex border border-[#8b0d0d] bg-[#8b0d0d] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#6f0808]"
                >
                  Editar ficha
                </button>
              )}
            </div>
          </div>

          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b0d0d]">
            Panel Admin · Bloodstock
          </p>

          <h1 className="text-center text-4xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
            {displayHorseName(horse)}
          </h1>

          <HorseCenteredInfoLine horse={horse} />
        </header>

        {saveMessage ? (
          <div className="mb-5">
            <MessageBox
              text={saveMessage}
              error={
                saveMessage.toLowerCase().includes("error") ||
                saveMessage.toLowerCase().includes("no se pudo")
              }
            />
          </div>
        ) : null}

        {isEditing ? (
          <EditHorsePanel
            form={editForm}
            saving={saving}
            onChange={updateEditField}
            onCancel={cancelEditing}
            onSave={saveHorseChanges}
          />
        ) : null}

        <div className="h-[2px] w-full bg-[#8b0d0d]" />

        <nav className="mt-5 flex flex-wrap justify-center gap-2">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                  active
                    ? "border-[#8b0d0d] bg-[#8b0d0d] text-white"
                    : "border-[#e5d3bd] bg-[#fffaf1] text-[#8b0d0d] hover:border-[#8b0d0d]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-5 h-[2px] w-full bg-[#8b0d0d]" />

        <section className="mt-6">
          {activeTab === "pedigree" ? (
            <PedigreeSection pedigree={pedigree} />
          ) : null}

          {activeTab === "progeny" ? (
            <ProgenySection
              title="Progeny"
              empty="Todavía no hay hijos registrados para este caballo."
              horses={horseRelations.progeny}
              horsesByKey={horsesByKey}
              relations={relations}
            />
          ) : null}

          {activeTab === "siblings" ? (
            <HorseListSection
              title="Siblings"
              empty="Todavía no hay hermanos registrados por madre."
              horses={horseRelations.siblings}
              horsesByKey={horsesByKey}
              relations={relations}
            />
          ) : null}

          {activeTab === "hypo_mating" ? (
            <HypoMatingSection
              horse={horse}
              horses={horses}
              horsesByKey={horsesByKey}
              relations={relations}
            />
          ) : null}

          {activeTab === "female_family" ? (
            <FemaleFamilySection
              mares={femaleMares}
              selectedKey={selectedFemaleFamilyKey}
              onSelect={setSelectedFemaleFamilyKey}
              tree={femaleFamilyTree}
              horsesByKey={horsesByKey}
              relations={relations}
            />
          ) : null}

          {activeTab === "tail_female" ? (
            <TailFemaleSection
              line={tailFemaleLine}
              horsesByKey={horsesByKey}
              relations={relations}
            />
          ) : null}

          {activeTab === "linebreeding" ? (
            <LinebreedingSection rows={linebreedingRows} />
          ) : null}

          {activeTab === "inbreeding" ? (
            <InbreedingSection rows={inbreedingRows} />
          ) : null}

          {![
            "pedigree",
            "progeny",
            "siblings",
            "hypo_mating",
            "female_family",
            "tail_female",
            "linebreeding",
            "inbreeding",
          ].includes(activeTab) ? (
            <ComingSoon
              title={TABS.find((tab) => tab.key === activeTab)?.label}
            />
          ) : null}
        </section>
      </section>
    </main>
  );
}

function EditHorsePanel({ form, saving, onChange, onCancel, onSave }) {
  const familyOptions = useMemo(() => {
    const detected = String(form.family || "")
      .replace(/[{}]/g, "")
      .trim();

    return [...new Set([...FAMILY_OPTIONS, detected].filter(Boolean))].sort(
      (a, b) => String(a).localeCompare(String(b), "en", { numeric: true }),
    );
  }, [form.family]);

  return (
    <div className="mb-6 border border-[#8b0d0d] bg-[#fffaf1] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
            Editar ficha
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#7a6258]">
            Solo se pueden corregir los mismos campos que se revisan al
            importar. Nombre, código, fuente y relaciones del pedigree quedan
            bloqueados.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="border border-[#8b0d0d] bg-[#fffaf1] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] hover:bg-[#f4eadb] disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="border border-[#8b0d0d] bg-[#8b0d0d] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#6f0808] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EditSelect
          label="País"
          value={form.country}
          options={COUNTRY_OPTIONS}
          onChange={(value) => onChange("country", value)}
        />
        <EditSelect
          label="Sexo"
          value={form.sex}
          options={SEX_OPTIONS}
          onChange={(value) => onChange("sex", value)}
        />
        <EditField
          label="Año"
          value={form.birth_year}
          onChange={(value) => onChange("birth_year", value)}
        />
        <EditSelect
          label="Pelo"
          value={form.coat}
          options={COAT_OPTIONS}
          onChange={(value) => onChange("coat", value)}
        />
        <EditField
          label="Familia"
          value={form.family}
          list="lineage-edit-family-options"
          placeholder="Ej: 4-k"
          onChange={(value) => onChange("family", value)}
        />
        <EditField
          label="DP"
          value={form.dosageProfile}
          onChange={(value) => onChange("dosageProfile", value)}
        />
        <EditField
          label="DI"
          value={form.dosageIndex}
          onChange={(value) => onChange("dosageIndex", value)}
        />
        <EditField
          label="CD"
          value={form.centerDistribution}
          onChange={(value) => onChange("centerDistribution", value)}
        />
      </div>

      <datalist id="lineage-edit-family-options">
        {familyOptions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </div>
  );
}

function EditSelect({ label, value, options, onChange }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a6258]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-[#e5d3bd] bg-white px-3 py-2 text-sm text-[#2b140f] outline-none focus:border-[#8b0d0d]"
      >
        {options.map((item) => (
          <option key={item.value || `empty-${label}`} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EditField({
  label,
  value,
  onChange,
  textarea = false,
  list = "",
  placeholder = "",
}) {
  const className =
    "mt-2 w-full border border-[#e5d3bd] bg-white px-3 py-2 text-sm text-[#2b140f] outline-none focus:border-[#8b0d0d]";

  return (
    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a6258]">
      {label}
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          placeholder={placeholder}
          className={`${className} min-h-[96px] resize-y`}
        />
      ) : (
        <input
          value={value}
          list={list || undefined}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={className}
        />
      )}
    </label>
  );
}

function HorseCenteredInfoLine({ horse }) {
  const year = cleanPiece(horse?.birth_year);
  const family = cleanPiece(horse?.family ? `{${horse.family}}` : "");
  const dosage = formatDosageOnly(horse?.dosage);

  const pieces = [year, family, dosage].filter(Boolean);

  if (!pieces.length) return null;

  return (
    <p className="mt-4 text-center text-sm font-medium leading-6 text-[#2b140f]">
      {pieces.join(" · ")}
    </p>
  );
}

function PedigreeSection({ pedigree }) {
  if (!pedigree) {
    return <MessageBox text="No se pudo armar el pedigree." />;
  }

  return <LineagePedigree pedigree={pedigree} />;
}

function HypoMatingSection({ horse, horses, horsesByKey, relations }) {
  const [query, setQuery] = useState("");
  const [selectedMateKey, setSelectedMateKey] = useState("");
  const [showResults, setShowResults] = useState(false);

  const currentIsFemale = isFemaleHorse(horse);
  const currentIsMale = !currentIsFemale;

  const selectedMate = selectedMateKey
    ? horsesByKey.get(selectedMateKey) || null
    : null;

  const filteredResults = useMemo(() => {
    const clean = String(query || "").trim().toLowerCase();

    if (!clean || clean.length < 2) return [];

    return horses
      .filter((item) => item?.external_key && item.external_key !== horse?.external_key)
      .filter((item) => String(item?.name || "").toLowerCase().includes(clean))
      .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")))
      .slice(0, 20);
  }, [horses, horse, query]);

  const selectedMateTree = useMemo(() => {
    if (!selectedMate?.external_key) return null;

    return buildPedigreeTree({
      rootExternalKey: selectedMate.external_key,
      horsesByKey,
      relations,
      maxDepth: 5,
    });
  }, [selectedMate, horsesByKey, relations]);

  const fixedHorseTree = useMemo(() => {
    if (!horse?.external_key) return null;

    return buildPedigreeTree({
      rootExternalKey: horse.external_key,
      horsesByKey,
      relations,
      maxDepth: 5,
    });
  }, [horse, horsesByKey, relations]);

  const hypoPedigree = useMemo(() => {
    return {
      name: "Hypothetical Foal",
      external_key: "hypothetical-foal",
      sex: "",
      father: currentIsMale ? fixedHorseTree : selectedMateTree,
      mother: currentIsFemale ? fixedHorseTree : selectedMateTree,
    };
  }, [currentIsFemale, currentIsMale, fixedHorseTree, selectedMateTree]);

  const helpText = currentIsFemale
    ? "La yegua actual queda fija abajo. Buscá el padrillo para completar la línea de arriba."
    : "El caballo actual queda fijo arriba. Buscá la yegua para completar la línea de abajo.";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
            Hypo Mating
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#7a6258]">{helpText}</p>
        </div>
      </div>

      <div className="mb-5 border border-[#e5d3bd] bg-[#fffaf1] p-4 shadow-sm">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
          {currentIsFemale ? "Buscar padrillo" : "Buscar yegua"}
        </label>

        <div className="relative mt-3">
          <div className="flex items-center gap-3 border border-[#d8c6b0] bg-white px-4 py-3 transition focus-within:border-[#8b0d0d] focus-within:shadow-[0_0_0_1px_rgba(139,13,13,0.08)]">
            <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
              Buscar
            </span>
            <input
              value={query}
              onFocus={() => setShowResults(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowResults(true);
                if (!event.target.value.trim()) {
                  setSelectedMateKey("");
                }
              }}
              placeholder={currentIsFemale ? "Escribí un padrillo..." : "Escribí una yegua..."}
              className="w-full border-0 bg-transparent p-0 text-sm font-medium text-[#2b140f] outline-none placeholder:text-[#9c8579]"
            />

            {selectedMateKey ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedMateKey("");
                  setQuery("");
                  setShowResults(false);
                }}
                className="border border-[#8b0d0d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] transition hover:bg-[#8b0d0d] hover:text-white"
              >
                Limpiar
              </button>
            ) : null}
          </div>

          {showResults && query.trim().length >= 2 ? (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-[300px] overflow-y-auto border border-[#d8c6b0] bg-white shadow-[0_18px_30px_rgba(43,20,15,0.12)]">
              {filteredResults.length ? (
                filteredResults.map((item) => {
                  const isSelected = item.external_key === selectedMateKey;
                  const isFemale = isFemaleHorse(item);

                  return (
                    <button
                      key={item.external_key}
                      type="button"
                      onClick={() => {
                        setSelectedMateKey(item.external_key);
                        setQuery(displayHorseName(item));
                        setShowResults(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 border-b border-[#efe2d3] px-4 py-3 text-left transition last:border-b-0 ${
                        isSelected ? "bg-[#f8f1e5]" : "bg-white hover:bg-[#fff7ee]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold uppercase text-[#8b0d0d]">
                          {displayHorseName(item)}
                        </div>
                        <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#7a6258]">
                          {[formatSex(item), item.birth_year, item.family ? `{${item.family}}` : ""]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </div>

                      <span
                        className="shrink-0 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                        style={{
                          borderColor: isFemale ? "#d7a688" : "#cdbfaf",
                          background: isFemale ? COLORS.female : COLORS.male,
                          color: COLORS.text,
                        }}
                      >
                        {isFemale ? "Yegua" : "Caballo"}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-4 text-sm text-[#7a6258]">
                  No encontramos caballos con ese nombre.
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <LineagePedigree pedigree={hypoPedigree} />
    </div>
  );
}

function ProgenySection({ title, horses, empty, horsesByKey, relations }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
        {title}
      </h2>

      {!horses.length ? (
        <MessageBox text={empty} />
      ) : (
        <div className="overflow-x-auto border border-[#8b0d0d]">
          <table className="min-w-[860px] w-full border-collapse bg-transparent text-sm">
            <thead className="bg-[#8b0d0d] text-white">
              <tr>
                <Th>Nombre</Th>
                <Th>Año</Th>
                <Th>Sexo</Th>
                <Th>Padre</Th>
                <Th>Ficha</Th>
              </tr>
            </thead>

            <tbody>
              {horses.map((item) => {
                const href = `/paneladmin/blood-races/caballos/${encodeURIComponent(
                  item.external_key,
                )}`;
                const father = getFatherForHorse(item, horsesByKey, relations);

                return (
                  <tr
                    key={item.external_key}
                    className="border-t border-[#e5d3bd] transition hover:bg-[#f4eadb]"
                  >
                    <Td strong>{displayHorseName(item)}</Td>
                    <Td>{item.birth_year}</Td>
                    <Td>{formatSex(item)}</Td>
                    <Td>{father ? <HorseNameLink horse={father} /> : "-"}</Td>
                    <Td>
                      <Link
                        href={href}
                        className="inline-flex border border-[#8b0d0d] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] no-underline hover:bg-[#8b0d0d] hover:text-white"
                      >
                        Ver ficha
                      </Link>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LineagePedigree({ pedigree }) {
  const columns = buildPedigreeColumns(pedigree, 5);

  return (
    <div className="overflow-x-auto">
      <div
        style={{
          minWidth: 980,
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 5,
          alignItems: "stretch",
        }}
      >
        {columns.map((column, colIndex) => (
          <div
            key={`col-${colIndex}`}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
              gap: 2,
            }}
          >
            {column.map((node, nodeIndex) =>
              node ? (
                <PedigreeCard
                  key={`${
                    node.external_key || node.name
                  }-${colIndex}-${nodeIndex}`}
                  node={node}
                />
              ) : (
                <div
                  key={`empty-${colIndex}-${nodeIndex}`}
                  className="h-[100px] border border-dashed border-[#e5d3bd] bg-white/50"
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PedigreeCard({ node }) {
  const isFemale = String(node?.sex || "").toUpperCase() === "HEMBRA";
  const href = node?.external_key
    ? `/paneladmin/blood-races/caballos/${encodeURIComponent(
        node.external_key,
      )}`
    : "#";

  return (
    <Link
      href={href}
      className="flex h-[100px] items-center justify-center border px-2 py-0 text-center no-underline shadow-sm transition hover:scale-[1.01] hover:border-[#8b0d0d]"
      style={{
        borderColor: isFemale ? "#D7A688" : "#CDBFAF",
        background: isFemale ? COLORS.female : COLORS.male,
      }}
    >
      <div
        className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap uppercase text-[#2b140f]"
        style={{
          fontSize: "11px",
          lineHeight: 1.15,
          fontWeight: 900,
        }}
      >
        {displayHorseName(node)}
      </div>
    </Link>
  );
}

function HorseListSection({ title, horses, empty, horsesByKey, relations }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
        {title}
      </h2>

      {!horses.length ? (
        <MessageBox text={empty} />
      ) : (
        <div className="overflow-x-auto border border-[#8b0d0d]">
          <table className="min-w-[860px] w-full border-collapse bg-transparent text-sm">
            <thead className="bg-[#8b0d0d] text-white">
              <tr>
                <Th>Nombre</Th>
                <Th>Año</Th>
                <Th>Sexo</Th>
                <Th>Padre</Th>
                <Th>Ficha</Th>
              </tr>
            </thead>

            <tbody>
              {horses.map((item) => {
                const href = `/paneladmin/blood-races/caballos/${encodeURIComponent(
                  item.external_key,
                )}`;
                const father = getFatherForHorse(item, horsesByKey, relations);

                return (
                  <tr
                    key={item.external_key}
                    className="border-t border-[#e5d3bd] transition hover:bg-[#f4eadb]"
                  >
                    <Td strong>{displayHorseName(item)}</Td>
                    <Td>{item.birth_year}</Td>
                    <Td>{formatSex(item)}</Td>
                    <Td>{father ? <HorseNameLink horse={father} /> : "-"}</Td>
                    <Td>
                      <Link
                        href={href}
                        className="inline-flex border border-[#8b0d0d] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d] no-underline hover:bg-[#8b0d0d] hover:text-white"
                      >
                        Ver ficha
                      </Link>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TailFemaleSection({ line, horsesByKey, relations }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
        Tail Female
      </h2>

      {!line.length ? (
        <MessageBox text="No hay madre cargada para este caballo, entonces no se puede armar la Tail Female." />
      ) : (
        <div className="overflow-x-auto border border-[#8b0d0d]">
          <table className="min-w-[1080px] w-full border-collapse bg-transparent text-sm">
            <thead className="bg-[#8b0d0d] text-white">
              <tr>
                <Th>Yegua</Th>
                <Th>País</Th>
                <Th>Año</Th>
                <Th>Familia</Th>
                <Th>Padre</Th>
                <Th>Familia padre</Th>
              </tr>
            </thead>

            <tbody>
              {line.map((item, index) => {
                const mare = item.horse;
                const father = getFatherForHorse(mare, horsesByKey, relations);

                return (
                  <tr
                    key={`${mare.external_key || mare.name}-${index}`}
                    className="border-t border-[#e5d3bd] transition hover:bg-[#f4eadb]"
                  >
                    <Td strong>
                      <HorseNameLink horse={mare} />
                    </Td>
                    <Td>{mare.country || "-"}</Td>
                    <Td>{mare.birth_year || "-"}</Td>
                    <Td>{mare.family ? `{${mare.family}}` : "-"}</Td>
                    <Td>{father ? <HorseNameLink horse={father} /> : "-"}</Td>
                    <Td>{father?.family ? `{${father.family}}` : "-"}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LinebreedingSection({ rows }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
            Linebreeding
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#7a6258]">
            Repeticiones de cualquier caballo dentro de las últimas 9 generaciones.
          </p>
        </div>

        <div className="border border-[#e5d3bd] bg-[#fffaf1] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d]">
          {rows.length} repetidos
        </div>
      </div>

      {!rows.length ? (
        <MessageBox text="No hay repeticiones registradas dentro de las últimas 9 generaciones." />
      ) : (
        <div className="overflow-x-auto border border-[#8b0d0d]">
          <table className="min-w-[1120px] w-full border-collapse bg-transparent text-sm">
            <thead className="bg-[#8b0d0d] text-white">
              <tr>
                <Th>Caballo</Th>
                <Th>Repeticiones</Th>
                <Th>Posiciones</Th>
                <Th>Líneas</Th>
                <Th>Sangre</Th>
                <Th>Influencia</Th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => {
                const isFemale = isFemaleHorse(row.horse);

                return (
                  <tr
                    key={row.external_key}
                    className="border-t border-[#e5d3bd] transition hover:bg-[#f4eadb]"
                    style={{
                      background: isFemale
                        ? "linear-gradient(90deg, rgba(139, 13, 13, 0.07), rgba(255, 249, 239, 0.95))"
                        : "transparent",
                    }}
                  >
                    <Td strong>
                      <HorseNameLink horse={row.horse} />
                    </Td>
                    <Td>{row.count}</Td>
                    <Td>{row.positionsText}</Td>
                    <Td>{row.linesText}</Td>
                    <Td>{row.bloodPercent}</Td>
                    <Td>{row.influence}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InbreedingSection({ rows }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
            Inbreeding
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#7a6258]">
            Repeticiones del mismo caballo compartidas entre la línea del padre y la línea de la madre dentro de las primeras 5 generaciones.
          </p>
        </div>

        <div className="border border-[#e5d3bd] bg-[#fffaf1] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b0d0d]">
          {rows.length} repetidos
        </div>
      </div>

      {!rows.length ? (
        <MessageBox text="No hay inbreeding registrado entre la línea paterna y materna dentro de las primeras 5 generaciones." />
      ) : (
        <div className="overflow-x-auto border border-[#8b0d0d]">
          <table className="min-w-[1120px] w-full border-collapse bg-transparent text-sm">
            <thead className="bg-[#8b0d0d] text-white">
              <tr>
                <Th>Caballo</Th>
                <Th>Repeticiones</Th>
                <Th>Posiciones</Th>
                <Th>Líneas</Th>
                <Th>Sangre</Th>
                <Th>Influencia</Th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => {
                const isFemale = isFemaleHorse(row.horse);

                return (
                  <tr
                    key={row.external_key}
                    className="border-t border-[#e5d3bd] transition hover:bg-[#f4eadb]"
                    style={{
                      background: isFemale
                        ? "linear-gradient(90deg, rgba(139, 13, 13, 0.07), rgba(255, 249, 239, 0.95))"
                        : "transparent",
                    }}
                  >
                    <Td strong>
                      <HorseNameLink horse={row.horse} />
                    </Td>
                    <Td>{row.count}</Td>
                    <Td>{row.positionsText}</Td>
                    <Td>{row.linesText}</Td>
                    <Td>{row.bloodPercent}</Td>
                    <Td>{row.influence}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FemaleFamilySection({
  mares,
  selectedKey,
  onSelect,
  tree,
  horsesByKey,
  relations,
}) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
            Female Family
          </h2>
        </div>

        <label className="block min-w-[300px] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a6258]">
          Seleccionar yegua base
          <select
            value={selectedKey}
            onChange={(event) => onSelect(event.target.value)}
            className="mt-2 w-full border-0 border-b border-[#8b0d0d] bg-transparent px-1 py-2 text-sm font-semibold text-[#2b140f] outline-none"
          >
            <option value="">Buscar yegua...</option>
            {mares.map((mare) => (
              <option key={mare.external_key} value={mare.external_key}>
                {displayHorseName(mare)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!selectedKey ? (
        <MessageBox text="Seleccioná una yegua para ver su Female Family." />
      ) : !tree ? (
        <MessageBox text="No se pudo armar la familia femenina para esa yegua." />
      ) : (
        <div>
          {tree.children.length ? (
            <div className="overflow-x-auto border-y border-[#8b0d0d]">
              <div className="min-w-[760px] bg-[#fff9ef]">
                <div className="grid grid-cols-[2.8fr_0.65fr_0.85fr_1.7fr] border-b border-[#8b0d0d] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b0d0d]">
                  <div>Nombre</div>
                  <div>Año</div>
                  <div>Sexo</div>
                  <div>Padre</div>
                </div>

                <FemaleFamilyRows
                  nodes={tree.children}
                  level={0}
                  horsesByKey={horsesByKey}
                  relations={relations}
                />
              </div>
            </div>
          ) : (
            <MessageBox text="Todavía no hay hijos registrados para esta yegua." />
          )}
        </div>
      )}
    </div>
  );
}

function FemaleFamilyRows({ nodes, level, horsesByKey, relations }) {
  if (!nodes.length) return null;

  return (
    <div>
      {nodes.map((node) => {
        const child = node.horse;
        const isFemale = isFemaleHorse(child);
        const father = getFatherForHorse(child, horsesByKey, relations);
        const hasFemaleBranch = isFemale && node.children.length > 0;
        return (
          <div key={`${child.external_key || child.name}-${level}`}>
            <div
              className="grid grid-cols-[2.8fr_0.65fr_0.85fr_1.7fr] items-center border-b border-[#e5d3bd] px-3 text-[13px] transition hover:bg-[#f8f1e5]"
              style={{
                background: isFemale
                  ? "linear-gradient(90deg, rgba(139, 13, 13, 0.06), rgba(255, 249, 239, 0.95))"
                  : "transparent",
              }}
            >
              <div className="py-1.5 pr-2">
                <div
                  className="relative flex items-center gap-2"
                  style={{ paddingLeft: level ? level * 30 : 0 }}
                >
                  {level ? (
                    <span
                      className="absolute top-1/2 h-px bg-[#d7a688]"
                      style={{
                        left: level * 30 - 22,
                        width: 18,
                      }}
                    />
                  ) : null}

                  <div className="min-w-0 border-l border-[#d7a688] pl-3">
                    <HorseNameLink horse={child} />
                    {hasFemaleBranch ? (
                      <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a6258]">
                        rama
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="py-1.5 pr-2 text-[#2b140f]">
                {child.birth_year || "-"}
              </div>

              <div className="py-1.5 pr-2 text-[#2b140f]">{formatSex(child)}</div>

              <div className="py-1.5 pr-2 text-[#2b140f]">
                {father ? <HorseNameLink horse={father} /> : "-"}
              </div>
            </div>

            {hasFemaleBranch ? (
              <div className="relative">
                <div
                  className="absolute bottom-0 top-0 border-l border-[#d7a688]"
                  style={{ left: 26 + level * 30 }}
                />
                <FemaleFamilyRows
                  nodes={node.children}
                  level={level + 1}
                  horsesByKey={horsesByKey}
                  relations={relations}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function HorseNameLink({ horse }) {
  if (!horse?.external_key) {
    return displayHorseName(horse);
  }

  return (
    <Link
      href={`/paneladmin/blood-races/caballos/${encodeURIComponent(
        horse.external_key,
      )}`}
      className="font-semibold text-[#8b0d0d] underline decoration-transparent underline-offset-4 transition hover:decoration-[#8b0d0d]"
    >
      {displayHorseName(horse)}
    </Link>
  );
}

function ComingSoon({ title }) {
  return (
    <div className="border border-[#e5d3bd] bg-white p-6">
      <h2 className="text-xl font-semibold uppercase tracking-[0.04em] text-[#8b0d0d]">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#6f5b50]">
        Esta sección queda preparada. Después definimos qué relaciones exactas
        tiene que mostrar y la conectamos a la base.
      </p>
    </div>
  );
}

function buildLinebreedingRows({
  rootExternalKey,
  horsesByKey,
  relations,
  maxGeneration = 9,
}) {
  if (!rootExternalKey || !horsesByKey?.size) return [];

  const occurrences = [];

  function getParentKey(childExternalKey, relationType) {
    return (
      relations.find(
        (rel) =>
          rel.child_external_key === childExternalKey &&
          rel.relation_type === relationType,
      )?.parent_external_key || ""
    );
  }

  function walk(externalKey, generation, side, path) {
    if (!externalKey || generation > maxGeneration) return;
    if (path.has(externalKey)) return;

    const horse = horsesByKey.get(externalKey);
    if (!horse) return;

    occurrences.push({
      external_key: externalKey,
      horse,
      generation,
      side,
      position: `${generation}${side}`,
      bloodValue: 100 / 2 ** generation,
    });

    const nextPath = new Set(path);
    nextPath.add(externalKey);

    walk(getParentKey(externalKey, "father"), generation + 1, side, nextPath);
    walk(getParentKey(externalKey, "mother"), generation + 1, side, nextPath);
  }

  walk(getParentKey(rootExternalKey, "father"), 1, "S", new Set([rootExternalKey]));
  walk(getParentKey(rootExternalKey, "mother"), 1, "D", new Set([rootExternalKey]));

  const grouped = new Map();

  occurrences.forEach((item) => {
    const key = item.external_key;
    const current = grouped.get(key) || {
      external_key: key,
      horse: item.horse,
      positions: [],
      count: 0,
      sireLines: 0,
      damLines: 0,
      bloodValue: 0,
      generations: [],
    };

    current.positions.push(item);
    current.count += 1;
    current.bloodValue += item.bloodValue;
    current.generations.push(item.generation);

    if (item.side === "S") current.sireLines += 1;
    if (item.side === "D") current.damLines += 1;

    grouped.set(key, current);
  });

  return [...grouped.values()]
    .filter((row) => row.count > 1)
    .map((row) => {
      const sortedPositions = row.positions.sort((a, b) => {
        if (a.generation !== b.generation) return a.generation - b.generation;
        return a.side.localeCompare(b.side);
      });
      const generationNumbers = sortedPositions.map((item) => item.generation);
      const closestGeneration = Math.min(...generationNumbers);
      const farthestGeneration = Math.max(...generationNumbers);

      return {
        ...row,
        positionsText: sortedPositions
          .map((item) => item.position)
          .join(" x "),
        linesText: `${row.count} (${row.sireLines}) (${row.damLines})`,
        bloodPercent: `${formatPercent(row.bloodValue)}%`,
        influence:
          closestGeneration === farthestGeneration
            ? `${closestGeneration}x${closestGeneration}`
            : `${closestGeneration}x${farthestGeneration}`,
        strongestGeneration: closestGeneration,
      };
    })
    .sort((a, b) => {
      if (b.bloodValue !== a.bloodValue) return b.bloodValue - a.bloodValue;
      if (a.strongestGeneration !== b.strongestGeneration) {
        return a.strongestGeneration - b.strongestGeneration;
      }
      return String(a.horse?.name || "").localeCompare(String(b.horse?.name || ""));
    });
}

function buildInbreedingRows({
  rootExternalKey,
  horsesByKey,
  relations,
  maxGeneration = 5,
}) {
  const rows = buildLinebreedingRows({
    rootExternalKey,
    horsesByKey,
    relations,
    maxGeneration,
  });

  return rows
    .filter((row) => row.sireLines > 0 && row.damLines > 0)
    .map((row) => ({
      ...row,
      inbreedingCount: 1,
    }));
}

function formatPercent(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return "0.00";
  return number.toFixed(2);
}

function buildPedigreeTree({
  rootExternalKey,
  horsesByKey,
  relations,
  maxDepth = 5,
}) {
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
          rel.child_external_key === externalKey &&
          rel.relation_type === "father",
      )?.parent_external_key || "";

    const motherKey =
      relations.find(
        (rel) =>
          rel.child_external_key === externalKey &&
          rel.relation_type === "mother",
      )?.parent_external_key || "";

    return {
      ...horse,
      father:
        depth < maxDepth ? buildNode(fatherKey, depth + 1, nextVisited) : null,
      mother:
        depth < maxDepth ? buildNode(motherKey, depth + 1, nextVisited) : null,
    };
  }

  return buildNode(rootExternalKey);
}

function buildPedigreeColumns(root, depth = 5) {
  const cols = [];
  let current = [root?.father || null, root?.mother || null];

  for (let i = 0; i < depth; i += 1) {
    cols.push(current);

    const next = [];

    current.forEach((node) => {
      if (node) {
        next.push(node.father || null);
        next.push(node.mother || null);
      } else {
        next.push(null, null);
      }
    });

    current = next;
  }

  return cols;
}

function getMotherForHorse(horse, horsesByKey, relations) {
  if (!horse?.external_key) return null;

  const motherRel = relations.find(
    (rel) =>
      rel.child_external_key === horse.external_key &&
      rel.relation_type === "mother",
  );

  return motherRel
    ? horsesByKey.get(motherRel.parent_external_key) || null
    : null;
}

function buildTailFemaleLine({
  rootExternalKey,
  horsesByKey,
  relations,
  maxDepth = 80,
}) {
  const line = [];
  const visited = new Set();
  let currentExternalKey = rootExternalKey;
  let level = 1;

  while (currentExternalKey && level <= maxDepth) {
    if (visited.has(currentExternalKey)) break;
    visited.add(currentExternalKey);

    const motherRel = relations.find(
      (rel) =>
        rel.child_external_key === currentExternalKey &&
        rel.relation_type === "mother",
    );

    if (!motherRel?.parent_external_key) break;

    const mother = horsesByKey.get(motherRel.parent_external_key);
    if (!mother) break;

    line.push({
      horse: mother,
    });

    currentExternalKey = mother.external_key;
    level += 1;
  }

  return line;
}

function getRelatedFemaleMaresForHorse({ horse, horsesByKey, relations }) {
  const related = new Map();

  function addIfFemale(item) {
    if (item?.external_key && isFemaleHorse(item)) {
      related.set(item.external_key, item);
    }
  }

  addIfFemale(horse);

  buildTailFemaleLine({
    rootExternalKey: horse.external_key,
    horsesByKey,
    relations,
    maxDepth: 80,
  }).forEach((item) => addIfFemale(item.horse));

  return [...related.values()].sort((a, b) => {
    const yearA = parseBirthYear(a?.birth_year);
    const yearB = parseBirthYear(b?.birth_year);

    if (yearA !== null && yearB !== null && yearA !== yearB) {
      return yearB - yearA;
    }

    if (yearA !== null && yearB === null) return -1;
    if (yearA === null && yearB !== null) return 1;

    return String(a?.name || "").localeCompare(String(b?.name || ""));
  });
}

function buildFemaleFamilyTree({
  rootExternalKey,
  horsesByKey,
  relations,
  maxDepth = 12,
}) {
  function buildNode(externalKey, depth = 0, visited = new Set()) {
    if (!externalKey) return null;
    if (visited.has(externalKey)) return null;

    const horse = horsesByKey.get(externalKey);
    if (!horse) return null;

    const nextVisited = new Set(visited);
    nextVisited.add(externalKey);

    const children = relations
      .filter(
        (rel) =>
          rel.parent_external_key === externalKey &&
          rel.relation_type === "mother",
      )
      .map((rel) => horsesByKey.get(rel.child_external_key))
      .filter(Boolean)
      .sort(sortByBirthYearFirst)
      .map((child) => {
        const canOpenBranch = isFemaleHorse(child) && depth < maxDepth;

        return {
          horse: child,
          children: canOpenBranch
            ? buildNode(child.external_key, depth + 1, nextVisited)?.children ||
              []
            : [],
        };
      });

    return {
      horse,
      children,
    };
  }

  return buildNode(rootExternalKey);
}

function isFemaleHorse(horse) {
  const sex = normalizeSexForSave(horse?.sex || horse?.sex_raw || "");
  return sex === "HEMBRA";
}

function getFatherForHorse(horse, horsesByKey, relations) {
  if (!horse?.external_key) return null;

  const fatherRel = relations.find(
    (rel) =>
      rel.child_external_key === horse.external_key &&
      rel.relation_type === "father",
  );

  return fatherRel
    ? horsesByKey.get(fatherRel.parent_external_key) || null
    : null;
}

function sortByBirthYearFirst(a, b) {
  const yearA = parseBirthYear(a?.birth_year);
  const yearB = parseBirthYear(b?.birth_year);

  if (yearA !== null && yearB !== null && yearA !== yearB) {
    return yearA - yearB;
  }

  if (yearA !== null && yearB === null) return -1;
  if (yearA === null && yearB !== null) return 1;

  return String(a?.name || "").localeCompare(String(b?.name || ""));
}

function parseBirthYear(value) {
  const match = String(value || "").match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

function getEmptyHorseForm() {
  return {
    country: "",
    sex: "",
    coat: "",
    birth_year: "",
    family: "",
    dosageProfile: "",
    dosageIndex: "",
    centerDistribution: "",
  };
}

function horseToForm(horse) {
  const dosageParts = splitDosage(horse?.dosage || "");

  return {
    country: cleanEditableValue(horse?.country).toUpperCase(),
    sex: normalizeSexForSave(horse?.sex || horse?.sex_raw || ""),
    coat: cleanEditableValue(horse?.coat).toUpperCase(),
    birth_year: cleanEditableValue(horse?.birth_year),
    family: cleanEditableValue(horse?.family).replace(/[{}]/g, ""),
    dosageProfile: dosageParts.dp,
    dosageIndex: dosageParts.di,
    centerDistribution: dosageParts.cd,
  };
}

function formToHorsePayload(form) {
  const sex = normalizeSexForSave(form.sex);

  return {
    country: normalizeNullableUpper(form.country),
    sex: sex || null,
    sex_raw: shortSex(sex) || null,
    coat: normalizeNullableUpper(form.coat),
    birth_year: normalizeOptionalText(form.birth_year),
    family: normalizeOptionalText(
      String(form.family || "").replace(/[{}]/g, ""),
    ),
    dosage: normalizeOptionalText(buildDosageText(form)),
  };
}

function splitDosage(value) {
  const clean = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    dp:
      clean.match(/DP\s*=\s*([^·]+?)(?=\s+DI\s*=|\s+CD\s*=|$)/i)?.[1]?.trim() ||
      "",
    di: clean.match(/DI\s*=\s*([0-9.]+)/i)?.[1] || "",
    cd: clean.match(/CD\s*=\s*([0-9.-]+)/i)?.[1] || "",
  };
}

function buildDosageText(horse) {
  const dp = cleanEditableValue(horse?.dosageProfile);
  const di = cleanEditableValue(horse?.dosageIndex);
  const cd = cleanEditableValue(horse?.centerDistribution);

  return [
    dp ? `DP = ${dp}` : "",
    di ? `DI = ${di}` : "",
    cd ? `CD = ${cd}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function normalizeSexForSave(value) {
  const clean = String(value || "")
    .toUpperCase()
    .trim();

  if (!clean) return "";
  if (clean === "F") return "HEMBRA";
  if (clean === "M" || clean === "H") return "MACHO";
  if (clean === "C" || clean === "G") return "CASTRADO";
  if (clean.includes("CASTRADO") || clean.includes("GELDING"))
    return "CASTRADO";
  if (
    clean.includes("HEMBRA") ||
    clean.includes("FEMALE") ||
    clean.includes("MARE")
  ) {
    return "HEMBRA";
  }
  if (
    clean.includes("MACHO") ||
    clean.includes("MALE") ||
    clean.includes("STALLION")
  ) {
    return "MACHO";
  }

  return clean;
}

function shortSex(value) {
  const clean = String(value || "").toUpperCase();

  if (
    clean === "HEMBRA" ||
    clean.includes("FEMALE") ||
    clean.includes("MARE")
  ) {
    return "F";
  }

  if (
    clean === "MACHO" ||
    clean.includes("MALE") ||
    clean.includes("STALLION")
  ) {
    return "M";
  }

  if (clean === "CASTRADO" || clean.includes("GELDING")) {
    return "C";
  }

  return clean;
}

function normalizeNullableUpper(value) {
  const clean = cleanEditableValue(value).toUpperCase();
  return clean || null;
}

function cleanEditableValue(value) {
  return String(value === null || value === undefined ? "" : value).trim();
}

function normalizeOptionalText(value) {
  const clean = String(value || "").trim();
  return clean || null;
}

function formatSex(horse) {
  return cleanPiece(horse?.sex) || cleanPiece(horse?.sex_raw) || "-";
}

function displayHorseName(horse) {
  const name = cleanPiece(horse?.name) || "-";
  const country = cleanPiece(horse?.country);

  return country ? `${name} (${country})` : name;
}

function formatDosageOnly(value) {
  const clean = String(value || "").trim();

  if (!clean) return "";

  return clean
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/^GSV\s*=/i.test(part))
    .join(" · ");
}

function cleanPiece(value) {
  const clean = String(value || "").trim();
  return clean || "";
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

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.13em]">
      {children}
    </th>
  );
}

function Td({ children, strong = false }) {
  return (
    <td className="px-4 py-3 align-top text-[#2b140f]">
      {strong ? <strong>{children || "-"}</strong> : children || "-"}
    </td>
  );
}
