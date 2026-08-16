"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const COLORS = {
  wine: "#8B0E0E",
  wineDark: "#6F0909",
  cream: "#F8F1E5",
  cream2: "#FFF9EF",
  white: "#FFFFFF",
  text: "#2B1A14",
  muted: "#7A6258",
  border: "#E7D7C4",
  male: "#F1ECE6",
  female: "#F7E1D1",
  greenBg: "#F0FFF0",
  greenText: "#236423",
  greenBorder: "#B7D7B7",
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
  "1", "1-a", "1-b", "1-c", "1-d", "1-e", "1-f", "1-g", "1-h", "1-i", "1-k",
  "2", "2-a", "2-b", "2-c", "2-d", "2-e", "2-f", "2-g", "2-h", "2-i", "2-n",
  "3", "3-a", "3-b", "3-c", "3-d", "3-e", "3-f", "3-l", "3-n", "3-o",
  "4", "4-a", "4-b", "4-c", "4-d", "4-e", "4-f", "4-g", "4-k", "4-m", "4-n", "4-r",
  "5", "5-a", "5-b", "5-c", "5-d", "5-e", "5-f", "5-g", "5-h", "5-i", "5-j",
  "6", "6-a", "6-b", "6-c", "6-d", "6-e", "6-f", "6-x",
  "7", "7-a", "7-b", "7-c", "7-d", "7-e", "7-f",
  "8", "8-a", "8-b", "8-c", "8-d", "8-f", "8-g", "8-h", "8-i", "8-k",
  "9", "9-a", "9-b", "9-c", "9-e", "9-f", "9-g", "9-h",
  "10", "10-a", "10-b", "10-c", "10-d", "10-e",
  "11", "11-a", "11-b", "11-c", "11-d", "11-e", "11-f", "11-g",
  "12", "12-a", "12-b", "12-c", "12-d", "12-e",
  "13", "13-a", "13-b", "13-c", "13-d", "13-e",
  "14", "14-a", "14-b", "14-c", "14-f",
  "16", "16-a", "16-b", "16-c", "16-d", "16-e", "16-g", "16-h",
  "19", "19-a", "19-b", "19-c", "19-d",
  "20", "20-a", "20-b", "20-c",
  "21", "22", "23", "26", "A1", "A4", "A5", "C1",
];

export default function ImportarCaballosPage() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [data, setData] = useState(null);
  const [loadingImport, setLoadingImport] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(null);

  async function importar() {
    const cleanUrl = sourceUrl.trim();

    if (!cleanUrl) {
      setError("Pegá el link del caballo de Pedigree Query.");
      return;
    }

    setData(null);
    setSaveMessage("");
    setError("");
    setSuccessModal(null);
    setLoadingImport(true);

    try {
      const res = await fetch("/api/importar-caballos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "importUrl",
          horseName: "",
          url: cleanUrl,
          generations: 5,
        }),
      });

      const text = await res.text();
      let json = null;

      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(
          "La API no devolvió JSON. Revisá app/api/importar-caballos/route.js y reiniciá npm run dev."
        );
      }

      if (!res.ok) {
        throw new Error(json?.error || "Error importando pedigree.");
      }

      setData(normalizeImportedPayload(json));
    } catch (err) {
      setError(err?.message || "Error importando pedigree.");
    } finally {
      setLoadingImport(false);
    }
  }

  async function guardarEnBase() {
    if (!data?.horses?.length) {
      setError("Primero importá un pedigree válido.");
      return;
    }

    setSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const res = await fetch("/api/importar-caballos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "saveImportedPedigree",
          horses: data.horses || [],
          relations: data.relations || [],
          parentOverrides: data.parentOverrides || [],
          rootExternalKey:
            data?.horse?.externalKey ||
            data?.horse?.external_key ||
            data?.pedigree?.externalKey ||
            data?.pedigree?.external_key ||
            "",
          sourceUrl: data.sourceUrl || sourceUrl.trim(),
        }),
      });

      const text = await res.text();
      let json = null;

      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(
          "La API no devolvió JSON al guardar. Revisá app/api/importar-caballos/route.js y reiniciá npm run dev."
        );
      }

      if (!res.ok) {
        throw new Error(json?.error || "Error guardando caballo y pedigree.");
      }

      setSuccessModal({
        title: "Caballo importado correctamente :)",
        createdHorses: json.createdHorses || 0,
        existingHorses: json.existingHorses || 0,
        createdRelations: json.createdRelations || 0,
      });
    } catch (err) {
      setError(err?.message || "Error guardando caballo y pedigree.");
    } finally {
      setSaving(false);
    }
  }

  function importarOtro() {
    setSourceUrl("");
    setData(null);
    setSaveMessage("");
    setError("");
    setSuccessModal(null);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: COLORS.cream,
        color: COLORS.text,
      }}
    >
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "34px 20px 60px",
        }}
      >
        <header style={{ marginBottom: 28 }}>
          <Link
            href="/paneladmin/blood-races/caballos"
            style={{
              display: "inline-flex",
              border: `1px solid ${COLORS.wine}`,
              color: COLORS.wine,
              background: COLORS.cream2,
              padding: "11px 16px",
              textDecoration: "none",
              fontSize: 11,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 22,
            }}
          >
            Volver a caballos
          </Link>

          <p
            style={{
              margin: 0,
              color: COLORS.wine,
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontWeight: 800,
            }}
          >
            Panel Admin
          </p>

          <h1
            style={{
              margin: "8px 0 8px",
              fontSize: 42,
              lineHeight: 1,
              color: COLORS.wine,
              letterSpacing: "0.02em",
            }}
          >
            Importar caballo
          </h1>
        </header>

        <section
          style={{
            background: COLORS.cream2,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 0,
            padding: 18,
            boxShadow: "0 10px 30px rgba(76, 25, 16, 0.08)",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(260px, 1fr) 180px",
              gap: 12,
              alignItems: "end",
            }}
          >
            <Field label="Link del caballo en Pedigree Query">
              <input
                value={sourceUrl}
                onChange={(e) => {
                  setSourceUrl(e.target.value);
                  setData(null);
                  setSaveMessage("");
                  setError("");
                  setSuccessModal(null);
                }}
                placeholder="Ej: https://www.pedigreequery.com/camelot20"
                style={inputStyle}
              />
            </Field>

            <button
              onClick={importar}
              disabled={!sourceUrl.trim() || loadingImport}
              style={{
                border: 0,
                background:
                  !sourceUrl.trim() || loadingImport
                    ? "#B37A7A"
                    : COLORS.wine,
                color: COLORS.white,
                borderRadius: 0,
                padding: "13px 20px",
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor:
                  !sourceUrl.trim() || loadingImport
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {loadingImport ? "Importando..." : "Importar"}
            </button>
          </div>

          {error ? <ErrorBox text={error} /> : null}
        </section>

        {loadingImport ? (
          <div
            style={{
              background: COLORS.wine,
              color: COLORS.white,
              padding: 18,
              marginBottom: 22,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Importando pedigree...
          </div>
        ) : null}

        {data ? (
          <Result
            data={data}
            setData={setData}
            onSave={guardarEnBase}
            saving={saving}
          />
        ) : null}

        {successModal ? (
          <ImportSuccessModal
            info={successModal}
            onImportAnother={importarOtro}
            onClose={() => setSuccessModal(null)}
          />
        ) : null}
      </section>
    </main>
  );
}

function ImportSuccessModal({ info, onImportAnother, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(43, 26, 20, 0.42)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
      }}
    >
      <div
        style={{
          width: "min(440px, 100%)",
          background: COLORS.cream2,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 24px 70px rgba(43, 26, 20, 0.28)",
          padding: 24,
          textAlign: "center",
          color: COLORS.text,
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            color: COLORS.wine,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Importación guardada
        </p>

        <h3
          style={{
            margin: "0 0 12px",
            color: COLORS.wine,
            fontSize: 28,
            lineHeight: 1.05,
            textTransform: "uppercase",
          }}
        >
          {info?.title || "Caballo importado correctamente :)"}
        </h3>

        <p
          style={{
            margin: "0 auto 14px",
            maxWidth: 330,
            color: COLORS.muted,
            fontSize: 13,
            lineHeight: 1.55,
            fontWeight: 700,
          }}
        >
          Ya quedó guardado en la base de datos de Lineage.
        </p>

        <div
          style={{
            border: `1px solid ${COLORS.greenBorder}`,
            background: COLORS.greenBg,
            color: COLORS.greenText,
            padding: 12,
            margin: "0 0 18px",
            textAlign: "left",
            fontSize: 13,
            fontWeight: 800,
            lineHeight: 1.65,
          }}
        >
          <div>{info?.createdHorses || 0} caballos nuevos importados</div>
          <div>{info?.existingHorses || 0} caballos ya existían</div>
          <div>{info?.createdRelations || 0} relaciones nuevas creadas</div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onImportAnother}
            style={{
              border: 0,
              background: COLORS.wine,
              color: COLORS.white,
              padding: "12px 14px",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Importar otro
          </button>

          <Link
            href="/paneladmin/blood-races/caballos"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${COLORS.wine}`,
              background: COLORS.white,
              color: COLORS.wine,
              padding: "12px 14px",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Volver al listado
          </Link>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 14,
            border: 0,
            background: "transparent",
            color: COLORS.muted,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function Result({ data, setData, onSave, saving }) {
  const horse = getRootHorse(data);
  const header = data?.debug?.rootHeader || {};
  const title = formatHorseTitle(horse, header, data);

  return (
    <section
      style={{
        background: COLORS.cream2,
        color: COLORS.text,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 0,
        padding: 22,
        boxShadow: "0 18px 40px rgba(76, 25, 16, 0.12)",
      }}
    >
      <div
        style={{
          background: COLORS.white,
          border: `1px solid ${COLORS.border}`,
          padding: 16,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: COLORS.wine,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 900,
              }}
            >
              Pedigree importado
            </p>

            <h2
              style={{
                margin: "8px 0 4px",
                fontSize: 34,
                lineHeight: 1.05,
                color: COLORS.wine,
                textTransform: "uppercase",
              }}
            >
              {title}
            </h2>

            <PedigreeQueryInfoLine horse={horse} header={header} data={data} />
          </div>

          <span
            style={{
              background: COLORS.cream,
              color: COLORS.wine,
              border: `1px solid ${COLORS.border}`,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            {data.sourceLabel || "Pedigree Query"}
          </span>
        </div>
      </div>

      <EditableRootHorseForm data={data} setData={setData} />

      <div
        style={{
          background: COLORS.white,
          border: `1px solid ${COLORS.border}`,
          color: COLORS.text,
          borderRadius: 0,
          padding: 14,
          marginBottom: 18,
        }}
      >
        {data.pedigree ? (
          <LineagePedigree data={data} setData={setData} />
        ) : (
          <EmptyBox text="No se pudo armar el pedigree visual." />
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: 16,
            paddingTop: 14,
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            style={{
              border: 0,
              background: saving ? "#B37A7A" : COLORS.wine,
              color: COLORS.white,
              borderRadius: 0,
              padding: "12px 18px",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Guardando..." : "Guardar en base"}
          </button>
        </div>

      </div>
    </section>
  );
}

function EditableRootHorseForm({ data, setData }) {
  const horse = getRootHorse(data);

  const familyOptions = useMemo(() => {
    const detectedFamilies = (data?.horses || [])
      .map((item) => String(item?.family || "").replace(/[{}]/g, "").trim())
      .filter(Boolean);

    return [...new Set([...FAMILY_OPTIONS, ...detectedFamilies])].sort((a, b) =>
      String(a).localeCompare(String(b), "en", { numeric: true })
    );
  }, [data?.horses]);

  return (
    <div
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        padding: 16,
        marginBottom: 18,
      }}
    >
      <p
        style={{
          margin: "0 0 12px",
          color: COLORS.wine,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        Revisar datos antes de guardar
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        <Field label="País">
          <select
            value={getEditableValue(horse, "country")}
            onChange={(e) => {
              setData((current) =>
                updateRootHorse(current, "country", e.target.value)
              );
            }}
            style={inputStyle}
          >
            {COUNTRY_OPTIONS.map((item) => (
              <option key={item.value || "empty-country"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Sexo">
          <select
            value={getEditableValue(horse, "sex")}
            onChange={(e) => {
              setData((current) => updateRootHorse(current, "sex", e.target.value));
            }}
            style={inputStyle}
          >
            {SEX_OPTIONS.map((item) => (
              <option key={item.value || "empty-sex"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Año">
          <input
            value={getEditableValue(horse, "birthYear")}
            onChange={(e) => {
              setData((current) =>
                updateRootHorse(current, "birthYear", e.target.value)
              );
            }}
            style={inputStyle}
          />
        </Field>

        <Field label="Pelo">
          <select
            value={getEditableValue(horse, "coat")}
            onChange={(e) => {
              setData((current) => updateRootHorse(current, "coat", e.target.value));
            }}
            style={inputStyle}
          >
            {COAT_OPTIONS.map((item) => (
              <option key={item.value || "empty-coat"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Familia">
          <input
            value={getEditableValue(horse, "family")}
            list="lineage-family-options"
            onChange={(e) => {
              setData((current) => updateRootHorse(current, "family", e.target.value));
            }}
            placeholder="Ej: 4-k"
            style={inputStyle}
          />
          <datalist id="lineage-family-options">
            {familyOptions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </Field>

        <Field label="DP">
          <input
            value={getEditableValue(horse, "dosageProfile")}
            onChange={(e) => {
              setData((current) =>
                updateRootHorse(current, "dosageProfile", e.target.value)
              );
            }}
            style={inputStyle}
          />
        </Field>

        <Field label="DI">
          <input
            value={getEditableValue(horse, "dosageIndex")}
            onChange={(e) => {
              setData((current) =>
                updateRootHorse(current, "dosageIndex", e.target.value)
              );
            }}
            style={inputStyle}
          />
        </Field>

        <Field label="CD">
          <input
            value={getEditableValue(horse, "centerDistribution")}
            onChange={(e) => {
              setData((current) =>
                updateRootHorse(current, "centerDistribution", e.target.value)
              );
            }}
            style={inputStyle}
          />
        </Field>
      </div>
    </div>
  );
}

function normalizeImportedPayload(payload) {
  const rootKey = getRootExternalKey(payload);
  const root = {
    ...(payload?.horse || {}),
  };

  const dosageParts = splitDosage(
    root.dosage || payload?.debug?.rootHeader?.dosage || ""
  );

  root.name = stripCountryFromName(root.name || payload?.horseName || payload?.name || "");
  root.dosageProfile = root.dosageProfile || root.dosage_profile || dosageParts.dp || "";
  root.dosage_profile = root.dosageProfile;
  root.dosageIndex = root.dosageIndex || root.dosage_index || dosageParts.di || "";
  root.dosage_index = root.dosageIndex;
  root.centerDistribution =
    root.centerDistribution || root.center_distribution || dosageParts.cd || "";
  root.center_distribution = root.centerDistribution;
  root.sex = normalizeSexForSave(root.sex || root.sexRaw || root.sex_raw || "");
  root.sexRaw = root.sexRaw || root.sex_raw || shortSex(root.sex);
  root.sex_raw = root.sexRaw;

  const rootExternalKey = root.externalKey || root.external_key || rootKey;

  const horses = (payload?.horses || []).map((item) => {
    const itemKey = item.externalKey || item.external_key || "";
    if (itemKey !== rootExternalKey) return item;

    return {
      ...item,
      ...root,
      externalKey: item.externalKey || root.externalKey,
      external_key: item.external_key || root.external_key,
    };
  });

  return {
    ...payload,
    horse: root,
    horseName: root.name || payload?.horseName || payload?.name || "",
    name: root.name || payload?.name || "",
    horses,
    parentOverrides: payload?.parentOverrides || [],
    pedigree: payload?.pedigree
      ? mergeHorseIntoPedigree(payload.pedigree, rootExternalKey, root)
      : payload?.pedigree,
  };
}

function getRootHorse(data) {
  const rootKey = getRootExternalKey(data);
  const fromList = (data?.horses || []).find(
    (item) => (item.externalKey || item.external_key) === rootKey
  );

  return {
    ...(data?.horse || {}),
    ...(fromList || {}),
  };
}

function getRootExternalKey(data) {
  return (
    data?.horse?.externalKey ||
    data?.horse?.external_key ||
    data?.pedigree?.externalKey ||
    data?.pedigree?.external_key ||
    ""
  );
}

function updateRootHorse(current, key, value) {
  const data = current || {};
  const rootKey = getRootExternalKey(data);
  const root = getRootHorse(data);
  const updated = normalizeEditedHorseField(root, key, value);

  const horses = (data.horses || []).map((item) => {
    const itemKey = item.externalKey || item.external_key || "";
    if (itemKey !== rootKey) return item;

    return {
      ...item,
      ...updated,
    };
  });

  return {
    ...data,
    horse: updated,
    horseName: updated.name || data.horseName,
    name: updated.name || data.name,
    horses,
    pedigree: data.pedigree
      ? mergeHorseIntoPedigree(data.pedigree, rootKey, updated)
      : data.pedigree,
  };
}

function normalizeEditedHorseField(horse, key, value) {
  const clean = String(value || "").trimStart();
  const updated = { ...horse };

  if (key === "country") {
    updated.country = clean.toUpperCase();
  }

  if (key === "sex") {
    updated.sex = normalizeSexForSave(clean);
    updated.sexRaw = shortSex(updated.sex);
    updated.sex_raw = updated.sexRaw;
  }

  if (key === "birthYear") {
    updated.birthYear = clean;
    updated.birth_year = clean;
  }

  if (key === "coat") {
    updated.coat = clean.toUpperCase();
  }

  if (key === "family") {
    updated.family = clean.replace(/[{}]/g, "");
  }

  if (key === "dosageProfile") {
    updated.dosageProfile = clean;
    updated.dosage_profile = clean;
  }

  if (key === "dosageIndex") {
    updated.dosageIndex = clean;
    updated.dosage_index = clean;
  }

  if (key === "centerDistribution") {
    updated.centerDistribution = clean;
    updated.center_distribution = clean;
  }

  updated.name = stripCountryFromName(updated.name || "");
  updated.dosage = buildDosageText(updated);

  return updated;
}

function getEditableValue(horse, key) {
  if (key === "sex") return normalizeSexForSave(horse?.sex || horse?.sexRaw || horse?.sex_raw || "");
  if (key === "birthYear") return horse?.birthYear || horse?.birth_year || "";
  if (key === "dosageProfile") return horse?.dosageProfile || horse?.dosage_profile || "";
  if (key === "dosageIndex") return horse?.dosageIndex || horse?.dosage_index || "";
  if (key === "centerDistribution") {
    return horse?.centerDistribution || horse?.center_distribution || "";
  }

  return horse?.[key] || "";
}

function splitDosage(value) {
  const clean = String(value || "").replace(/\s+/g, " ").trim();

  return {
    dp:
      clean.match(/DP\s*=\s*([^·]+?)(?=\s+DI\s*=|\s+CD\s*=|$)/i)?.[1]?.trim() || "",
    di: clean.match(/DI\s*=\s*([0-9.]+)/i)?.[1] || "",
    cd: clean.match(/CD\s*=\s*([0-9.-]+)/i)?.[1] || "",
  };
}

function buildDosageText(horse) {
  const dp = horse?.dosageProfile || horse?.dosage_profile || "";
  const di = horse?.dosageIndex || horse?.dosage_index || "";
  const cd = horse?.centerDistribution || horse?.center_distribution || "";

  return [
    dp ? `DP = ${dp}` : "",
    di ? `DI = ${di}` : "",
    cd ? `CD = ${cd}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function mergeHorseIntoPedigree(node, externalKey, horse) {
  if (!node) return node;

  const nodeKey = node.externalKey || node.external_key || "";
  const merged =
    nodeKey === externalKey
      ? {
          ...node,
          ...horse,
        }
      : { ...node };

  return {
    ...merged,
    father: node.father
      ? mergeHorseIntoPedigree(node.father, externalKey, horse)
      : node.father,
    mother: node.mother
      ? mergeHorseIntoPedigree(node.mother, externalKey, horse)
      : node.mother,
  };
}

function formatHorseTitle(horse, header, data) {
  const name = stripCountryFromName(
    horse?.name || data?.horseName || data?.name || header?.name || "-"
  );
  const country = String(horse?.country || header?.country || "").trim().toUpperCase();

  return country ? `${name} (${country})` : name;
}

function stripCountryFromName(value) {
  return String(value || "")
    .replace(/\s*\(([A-Z]{2,4})\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function normalizeSexForSave(value) {
  const clean = String(value || "").toUpperCase().trim();

  if (!clean) return "";
  if (clean === "F") return "HEMBRA";
  if (clean === "M" || clean === "H") return "MACHO";
  if (clean === "C" || clean === "G") return "CASTRADO";
  if (clean.includes("CASTRADO") || clean.includes("GELDING")) return "CASTRADO";
  if (clean.includes("HEMBRA") || clean.includes("FEMALE") || clean.includes("MARE")) {
    return "HEMBRA";
  }
  if (clean.includes("MACHO") || clean.includes("MALE") || clean.includes("STALLION")) {
    return "MACHO";
  }

  return clean;
}

function PedigreeQueryInfoLine({ horse, header, data }) {
  const name = stripCountryFromName(
    data?.horseName || data?.name || horse?.name || header?.name || ""
  );
  const country = horse?.country || header?.country || "";
  const sex = normalizeSexForSave(horse?.sex || horse?.sexRaw || horse?.sex_raw || header?.sex || "");
  const birthYear = horse?.birthYear || horse?.birth_year || header?.birthYear || "";
  const coat = horse?.coat || header?.coat || "";
  const family = horse?.family || header?.family || "";
  const dosage = buildDosageText(horse) || horse?.dosage || header?.dosage || "";
  const record = horse?.record || "";
  const earnings = horse?.earnings || "";

  const mainBits = [
    country ? `(${String(country).toUpperCase()})` : "",
    coat ? `${coat}` : "",
    sex ? `${sex}` : "",
    birthYear ? `${birthYear}` : "",
    family ? `{${String(family).replace(/[{}]/g, "")}}` : "",
  ].filter(Boolean);

  return (
    <div
      style={{
        marginTop: 8,
        color: COLORS.text,
        fontSize: 14,
        lineHeight: 1.55,
      }}
    >
      <strong>{name}</strong>
      {mainBits.length ? ` ${mainBits.join(" ")}` : ""}

      {dosage ? (
        <span>
          {" "}
          <strong>·</strong> {dosage}
        </span>
      ) : null}

      {record ? (
        <span>
          {" "}
          <strong>·</strong> {record}
        </span>
      ) : null}

      {earnings ? (
        <span>
          {" "}
          <strong>· Career Earnings:</strong> {earnings}
        </span>
      ) : null}
    </div>
  );
}

function shortSex(value) {
  const clean = String(value || "").toUpperCase();

  if (clean === "HEMBRA" || clean.includes("FEMALE") || clean.includes("MARE")) {
    return "F";
  }

  if (clean === "MACHO" || clean.includes("MALE") || clean.includes("STALLION")) {
    return "M";
  }

  if (clean === "CASTRADO" || clean.includes("GELDING")) {
    return "C";
  }

  return clean;
}

function LineagePedigree({ data, setData }) {
  const columns = buildPedigreeColumns(data?.pedigree, 5);

  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: 0,
        border: `1px solid ${COLORS.border}`,
        background: "#FBF7F1",
        padding: 14,
      }}
    >
      <div
        style={{
          minWidth: 1220,
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        {columns.map((column, colIndex) => (
          <div
            key={`col-${colIndex}`}
            style={{
              minHeight: 420,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
              gap: 10,
            }}
          >
            {column.map((slot, nodeIndex) =>
              slot?.node ? (
                <PedigreeCard
                  key={`${slot.node.externalKey || slot.node.name}-${colIndex}-${nodeIndex}`}
                  node={slot.node}
                />
              ) : slot?.childExternalKey && slot?.relationType ? (
                <MissingParentSearchBox
                  key={`missing-${colIndex}-${nodeIndex}-${slot.childExternalKey}-${slot.relationType}`}
                  slot={slot}
                  setData={setData}
                />
              ) : (
                <div
                  key={`empty-${colIndex}-${nodeIndex}`}
                  style={{
                    height: 52,
                    borderRadius: 0,
                    border: `1px dashed ${COLORS.border}`,
                    background: "rgba(255,255,255,0.45)",
                  }}
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function buildPedigreeColumns(root, depth = 5) {
  const rootKey = root?.externalKey || root?.external_key || "";
  const cols = [];
  let current = [
    {
      node: root?.father || null,
      childExternalKey: rootKey,
      relationType: "father",
    },
    {
      node: root?.mother || null,
      childExternalKey: rootKey,
      relationType: "mother",
    },
  ];

  for (let i = 0; i < depth; i += 1) {
    cols.push(current);

    const next = [];

    current.forEach((slot) => {
      const node = slot?.node || null;
      const childExternalKey = node?.externalKey || node?.external_key || "";

      if (node && childExternalKey) {
        next.push({
          node: node.father || null,
          childExternalKey,
          relationType: "father",
        });
        next.push({
          node: node.mother || null,
          childExternalKey,
          relationType: "mother",
        });
      } else {
        next.push({ node: null, childExternalKey: "", relationType: "father" });
        next.push({ node: null, childExternalKey: "", relationType: "mother" });
      }
    });

    current = next;
  }

  return cols;
}

function MissingParentSearchBox({ slot, setData }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function searchHorse(value) {
    const clean = String(value || "").trim();
    setQuery(value);
    setMessage("");

    if (clean.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/importar-caballos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "searchLocalHorse",
          horseName: clean,
          name: clean,
          q: clean,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error || "No se pudo buscar en la base.");
      }

      const suggestions = json?.horses || json?.suggestions || json?.results || [];
      setResults(Array.isArray(suggestions) ? suggestions : []);
    } catch (err) {
      setResults([]);
      setMessage(err?.message || "No se pudo buscar en la base.");
    } finally {
      setLoading(false);
    }
  }

  function selectHorse(horse) {
    const normalized = normalizeLocalHorseForPedigree(horse);

    if (!normalized.externalKey && !normalized.external_key) {
      setMessage("Ese caballo no tiene external_key en la base.");
      return;
    }

    setData((current) => addSelectedParentToImport(current, slot, normalized));
    setQuery("");
    setResults([]);
    setMessage("");
  }

  const label = slot?.relationType === "mother" ? "Buscar madre" : "Buscar padre";

  return (
    <div
      style={{
        minHeight: 52,
        borderRadius: 0,
        border: `1px dashed ${COLORS.border}`,
        background: "rgba(255,255,255,0.72)",
        padding: "7px 8px",
        textAlign: "center",
        position: "relative",
      }}
    >
      <input
        value={query}
        onChange={(e) => searchHorse(e.target.value)}
        placeholder={label}
        style={{
          width: "100%",
          border: 0,
          borderBottom: `1px solid ${COLORS.border}`,
          background: "transparent",
          color: COLORS.text,
          outline: "none",
          textAlign: "center",
          fontSize: 11,
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      />

      <div
        style={{
          marginTop: 3,
          fontSize: 9,
          color: COLORS.muted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 800,
        }}
      >
        {loading ? "Buscando..." : "Vacío"}
      </div>

      {results.length ? (
        <div
          style={{
            position: "absolute",
            zIndex: 20,
            left: 0,
            right: 0,
            top: "100%",
            background: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 12px 24px rgba(76, 25, 16, 0.16)",
            maxHeight: 190,
            overflowY: "auto",
            textAlign: "left",
          }}
        >
          {results.slice(0, 8).map((item) => {
            const key = item.externalKey || item.external_key || item.id || item.name;
            const country = item.country ? ` (${String(item.country).toUpperCase()})` : "";
            const year = item.birthYear || item.birth_year ? ` · ${item.birthYear || item.birth_year}` : "";
            const family = item.family ? ` · {${String(item.family).replace(/[{}]/g, "")}}` : "";

            return (
              <button
                key={key}
                type="button"
                onClick={() => selectHorse(item)}
                style={{
                  width: "100%",
                  border: 0,
                  borderBottom: `1px solid ${COLORS.border}`,
                  background: COLORS.white,
                  color: COLORS.text,
                  padding: "9px 10px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                {stripCountryFromName(item.name || item.displayName || "-")}
                {country}
                <span style={{ color: COLORS.muted }}>{year}{family}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {message ? (
        <div
          style={{
            marginTop: 4,
            color: COLORS.wine,
            fontSize: 9,
            fontWeight: 800,
          }}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}

function normalizeLocalHorseForPedigree(horse) {
  if (!horse) return null;

  const externalKey = horse?.externalKey || horse?.external_key || horse?.id || "";
  const birthYear = horse?.birthYear || horse?.birth_year || horse?.birthdate || "";
  const sex = normalizeSexForSave(horse?.sex || horse?.sexRaw || horse?.sex_raw || "");

  const normalized = {
    ...horse,
    id: horse?.id || null,
    externalKey,
    external_key: externalKey,
    name: stripCountryFromName(horse?.name || horse?.displayName || ""),
    country: String(horse?.country || "").toUpperCase(),
    sex,
    sexRaw: horse?.sexRaw || horse?.sex_raw || shortSex(sex),
    sex_raw: horse?.sex_raw || horse?.sexRaw || shortSex(sex),
    coat: horse?.coat || "",
    birthYear,
    birth_year: birthYear,
    family: String(horse?.family || "").replace(/[{}]/g, ""),
    chefDeRace: horse?.chefDeRace || horse?.chef_de_race || "",
    chef_de_race: horse?.chef_de_race || horse?.chefDeRace || "",
    dosage: horse?.dosage || "",
    dosageProfile: horse?.dosageProfile || horse?.dosage_profile || "",
    dosage_profile: horse?.dosage_profile || horse?.dosageProfile || "",
    dosageIndex: horse?.dosageIndex || horse?.dosage_index || "",
    dosage_index: horse?.dosage_index || horse?.dosageIndex || "",
    centerDistribution: horse?.centerDistribution || horse?.center_distribution || "",
    center_distribution: horse?.center_distribution || horse?.centerDistribution || "",
    gsv: horse?.gsv || "",
    record: horse?.record || "",
    earnings: horse?.earnings || "",
    summary: horse?.summary || "",
    generation: horse?.generation || "",
    source: horse?.source || "manual_db",
    sourceLabel: horse?.sourceLabel || horse?.source_label || "Base de datos",
    source_label: horse?.source_label || horse?.sourceLabel || "Base de datos",
    sourceUrl: horse?.sourceUrl || horse?.source_url || "",
    source_url: horse?.source_url || horse?.sourceUrl || "",
  };

  if (horse?.father) {
    normalized.father = normalizeLocalHorseForPedigree(horse.father);
  }

  if (horse?.mother) {
    normalized.mother = normalizeLocalHorseForPedigree(horse.mother);
  }

  return normalized;
}

function collectPedigreeHorsesAndRelationsFromTree(node, collected = null) {
  const state =
    collected || {
      horsesByKey: new Map(),
      relationsByKey: new Map(),
      visited: new Set(),
    };

  if (!node) return state;

  const nodeKey = node.externalKey || node.external_key || "";
  if (!nodeKey || state.visited.has(nodeKey)) return state;

  state.visited.add(nodeKey);
  state.horsesByKey.set(nodeKey, node);

  [
    ["father", node.father],
    ["mother", node.mother],
  ].forEach(([relationType, parent]) => {
    const parentKey = parent?.externalKey || parent?.external_key || "";

    if (!parentKey) return;

    const relationKey = `${nodeKey}__${relationType}__${parentKey}`;

    state.relationsByKey.set(relationKey, {
      childExternalKey: nodeKey,
      child_external_key: nodeKey,
      parentExternalKey: parentKey,
      parent_external_key: parentKey,
      relationType,
      relation_type: relationType,
      source: parent?.source || "lineage_db",
    });

    collectPedigreeHorsesAndRelationsFromTree(parent, state);
  });

  return state;
}

function mergeUniqueHorses(existingHorses, incomingHorses) {
  const map = new Map();

  (existingHorses || []).forEach((horse) => {
    const key = horse?.externalKey || horse?.external_key || "";
    if (key) map.set(key, horse);
  });

  (incomingHorses || []).forEach((horse) => {
    const key = horse?.externalKey || horse?.external_key || "";
    if (!key) return;

    map.set(key, {
      ...(map.get(key) || {}),
      ...horse,
    });
  });

  return [...map.values()];
}

function mergeUniqueRelations(existingRelations, incomingRelations) {
  const map = new Map();

  (existingRelations || []).forEach((rel) => {
    const childKey = rel?.childExternalKey || rel?.child_external_key || "";
    const parentKey = rel?.parentExternalKey || rel?.parent_external_key || "";
    const relationType = rel?.relationType || rel?.relation_type || "";

    if (!childKey || !parentKey || !relationType) return;

    map.set(`${childKey}__${relationType}__${parentKey}`, rel);
  });

  (incomingRelations || []).forEach((rel) => {
    const childKey = rel?.childExternalKey || rel?.child_external_key || "";
    const parentKey = rel?.parentExternalKey || rel?.parent_external_key || "";
    const relationType = rel?.relationType || rel?.relation_type || "";

    if (!childKey || !parentKey || !relationType) return;

    map.set(`${childKey}__${relationType}__${parentKey}`, {
      childExternalKey: childKey,
      child_external_key: childKey,
      parentExternalKey: parentKey,
      parent_external_key: parentKey,
      relationType,
      relation_type: relationType,
      source: rel?.source || "lineage_db",
    });
  });

  return [...map.values()];
}

function addSelectedParentToImport(current, slot, selectedHorse) {
  if (!current || !slot?.childExternalKey || !slot?.relationType) return current;

  const parentKey = selectedHorse.externalKey || selectedHorse.external_key || "";
  const childKey = slot.childExternalKey;

  if (!parentKey || !childKey) return current;

  const relationType = slot.relationType;
  const cleanRelation = {
    childExternalKey: childKey,
    child_external_key: childKey,
    parentExternalKey: parentKey,
    parent_external_key: parentKey,
    relationType,
    relation_type: relationType,
    source: selectedHorse.source || "manual_db",
  };

  const collected = collectPedigreeHorsesAndRelationsFromTree(selectedHorse);
  const selectedHorses = [...collected.horsesByKey.values()];
  const selectedRelations = [...collected.relationsByKey.values()];

  const horses = mergeUniqueHorses(current.horses || [], selectedHorses);

  const relationsWithoutReplacedSlot = (current.relations || []).filter((rel) => {
    const relChild = rel.childExternalKey || rel.child_external_key || "";
    const relType = rel.relationType || rel.relation_type || "";
    return !(relChild === childKey && relType === relationType);
  });

  const relations = mergeUniqueRelations(relationsWithoutReplacedSlot, [
    cleanRelation,
    ...selectedRelations,
  ]);

  const parentOverrides = [
    ...(current.parentOverrides || []).filter(
      (item) =>
        !(
          item.childExternalKey === childKey &&
          item.relationType === relationType
        )
    ),
    {
      childExternalKey: childKey,
      relationType,
      parentExternalKey: parentKey,
    },
  ];

  return {
    ...current,
    horses,
    relations,
    parentOverrides,
    pedigree: setParentInPedigreeTree(
      current.pedigree,
      childKey,
      relationType,
      selectedHorse
    ),
  };
}
function setParentInPedigreeTree(node, childExternalKey, relationType, parentHorse) {
  if (!node) return node;

  const nodeKey = node.externalKey || node.external_key || "";

  if (nodeKey === childExternalKey) {
    return {
      ...node,
      [relationType]: parentHorse,
    };
  }

  return {
    ...node,
    father: node.father
      ? setParentInPedigreeTree(node.father, childExternalKey, relationType, parentHorse)
      : node.father,
    mother: node.mother
      ? setParentInPedigreeTree(node.mother, childExternalKey, relationType, parentHorse)
      : node.mother,
  };
}

function PedigreeCard({ node }) {
  const isFemale = String(node?.sex || "").toUpperCase() === "HEMBRA";
  const externalKey = node?.externalKey || node?.external_key || "";
  const href = externalKey
    ? `/paneladmin/blood-races/caballos/${encodeURIComponent(externalKey)}`
    : "#";

  return (
    <Link
      href={href}
      title="Abrir ficha del caballo"
      style={{
        display: "block",
        minHeight: 52,
        borderRadius: 0,
        border: `1px solid ${isFemale ? "#D7A688" : "#CDBFAF"}`,
        background: isFemale ? COLORS.female : COLORS.male,
        padding: "9px 10px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(80, 28, 16, 0.08)",
        textDecoration: "none",
        cursor: externalKey ? "pointer" : "default",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          textTransform: "uppercase",
          lineHeight: 1.25,
          color: COLORS.text,
        }}
      >
        {node?.name || "-"}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 10,
          fontWeight: 700,
          color: COLORS.muted,
          textTransform: "uppercase",
        }}
      >
        {[
          node?.country ? `(${node.country})` : "",
          node?.birthYear || node?.birth_year,
        ]
          .filter(Boolean)
          .join(" ")}
      </div>
    </Link>
  );
}

function EmptyBox({ text }) {
  return (
    <div
      style={{
        border: `1px dashed ${COLORS.border}`,
        background: "#FBF7F1",
        padding: 28,
        textAlign: "center",
        color: COLORS.muted,
      }}
    >
      {text}
    </div>
  );
}

function ErrorBox({ text }) {
  return (
    <div
      style={{
        marginTop: 14,
        border: "1px solid #E2A8A8",
        background: "#FFF0F0",
        color: "#8B0E0E",
        borderRadius: 0,
        padding: 12,
        whiteSpace: "pre-wrap",
      }}
    >
      {text}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          marginBottom: 6,
          color: COLORS.wine,
          fontSize: 12,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        {label}
      </span>

      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  border: `1px solid ${COLORS.border}`,
  background: COLORS.white,
  color: COLORS.text,
  padding: "13px 14px",
  fontSize: 14,
  outline: "none",
  borderRadius: 0,
};
