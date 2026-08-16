"use client";

import React, { useMemo, useState } from "react";
import { useLineageLanguage } from "../components/use-lineage-language";

function LineageIcon({ symbol, size = 18, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.86, lineHeight: 1 }}
    >
      {symbol}
    </span>
  );
}

function CalendarDays(props) {
  return <LineageIcon {...props} symbol="▦" />;
}
function ChevronLeft(props) {
  return <LineageIcon {...props} symbol="‹" />;
}
function ChevronRight(props) {
  return <LineageIcon {...props} symbol="›" />;
}
function Clock(props) {
  return <LineageIcon {...props} symbol="◷" />;
}
function Flag(props) {
  return <LineageIcon {...props} symbol="⚑" />;
}
function Globe2(props) {
  return <LineageIcon {...props} symbol="◎" />;
}
function MapPin(props) {
  return <LineageIcon {...props} symbol="⌖" />;
}
function Search(props) {
  return <LineageIcon {...props} symbol="⌕" />;
}
function Trophy(props) {
  return <LineageIcon {...props} symbol="♛" />;
}
function ListChecks(props) {
  return <LineageIcon {...props} symbol="☷" />;
}
function Users(props) {
  return <LineageIcon {...props} symbol="♙" />;
}
function Route(props) {
  return <LineageIcon {...props} symbol="↝" />;
}
function CircleDot(props) {
  return <LineageIcon {...props} symbol="●" />;
}
function Star(props) {
  return <LineageIcon {...props} symbol="★" />;
}
function Building2(props) {
  return <LineageIcon {...props} symbol="▥" />;
}
function ArrowUpRight(props) {
  return <LineageIcon {...props} symbol="↗" />;
}

const MONTH_NAMES = {
  es: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  pt: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

const WEEK_DAYS = {
  es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  pt: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

const LANGUAGE_LOCALE = {
  es: "es-UY",
  pt: "pt-BR",
  en: "en-US",
};

const TEXT = {
  es: {
    kicker: "Módulo de carreras",
    brand: "Lineage Races",
    title: "Carreras",
    intro:
      "Programas, resultados, inscripciones internacionales, ratings e información de carreras.",
    selectedDay: "Día seleccionado",
    countries: "Países",
    tracks: "Hipódromos",
    races: "Carreras",
    noRacesDay:
      "No hay carreras cargadas para este día. Podés elegir otro día del calendario o usar los próximos días destacados.",
    statsDays: "Días con carreras",
    statsCountries: "Países del calendario",
    statsTracks: "Hipódromos activos",
    statsRaces: "Carreras cargadas",
    calendar: "Calendario",
    noRacesShort: "Sin carreras",
    upcomingDays: "Próximos días",
    featuredRaces: "Carreras destacadas",
    racesCount: "carreras",
    nextStageTitle: "Próxima etapa Lineage",
    nextStageText:
      "Cada jornada puede conectarse con llamados, anotados, resultados, videos, fichas de caballos, jockeys, entrenadores, studs, estadísticas y reportes editoriales.",
    dayDetail: "Detalle del día",
    racesIn: "Hay carreras en",
    searchPlaceholder: "Buscar carrera, hipódromo, país...",
    allCountries: "Todos los países",
    noLoadedTitle: "Este día todavía no tiene carreras cargadas",
    noLoadedText:
      "Seleccioná otro día en el calendario. Los días con carreras muestran cantidad de carreras y países disponibles.",
    noFilterTitle: "No hay resultados para esos filtros",
    noFilterText: "Probá cambiar el país o la búsqueda.",
    forOwnersTitle: "Para propietarios",
    forOwnersText:
      "Ven de forma simple qué países corren cada día y entran al detalle de cada jornada.",
    forMarketTitle: "Para mercado",
    forMarketText:
      "Permite conectar calendarios de carreras con bloodstock, fichas, performances y análisis.",
    forAnalysisTitle: "Para análisis",
    forAnalysisText:
      "Después se puede agregar alertas, favoritos, resultados históricos y estadísticas avanzadas.",
    raceLabel: "Carrera",
    time: "Hora",
    surface: "Pista",
    distance: "Distancia",
    purse: "Bolsa",
    entries: "Anotados",
    horses: "caballos",
    pending: "Pendiente",
    viewRaceDetail: "Ver detalle de carrera",
    statusLabels: {
      Programada: "Programada",
      Confirmada: "Confirmada",
      "Inscripciones abiertas": "Inscripciones abiertas",
    },
    cards: [
      {
        title: "Programas",
        text: "Futuros programas de carreras e inscripciones internacionales.",
      },
      {
        title: "Resultados",
        text: "Resultados, ganadores e información de cada carrera.",
      },
      {
        title: "Ratings",
        text: "Ratings, datos de performance y futuras herramientas de carreras.",
      },
    ],
  },
  pt: {
    kicker: "Módulo de corridas",
    brand: "Lineage Races",
    title: "Corridas",
    intro:
      "Programas, resultados, inscrições internacionais, ratings e informações de corridas.",
    selectedDay: "Dia selecionado",
    countries: "Países",
    tracks: "Hipódromos",
    races: "Corridas",
    noRacesDay:
      "Não há corridas carregadas para este dia. Você pode escolher outro dia no calendário ou usar os próximos dias destacados.",
    statsDays: "Dias com corridas",
    statsCountries: "Países do calendário",
    statsTracks: "Hipódromos ativos",
    statsRaces: "Corridas carregadas",
    calendar: "Calendário",
    noRacesShort: "Sem corridas",
    upcomingDays: "Próximos dias",
    featuredRaces: "Corridas destacadas",
    racesCount: "corridas",
    nextStageTitle: "Próxima etapa Lineage",
    nextStageText:
      "Cada jornada pode ser conectada com inscrições, resultados, vídeos, fichas de cavalos, jóqueis, treinadores, studs, estatísticas e relatórios editoriais.",
    dayDetail: "Detalhe do dia",
    racesIn: "Há corridas em",
    searchPlaceholder: "Buscar corrida, hipódromo, país...",
    allCountries: "Todos os países",
    noLoadedTitle: "Este dia ainda não tem corridas carregadas",
    noLoadedText:
      "Selecione outro dia no calendário. Os dias com corridas mostram a quantidade de corridas e os países disponíveis.",
    noFilterTitle: "Não há resultados para esses filtros",
    noFilterText: "Tente mudar o país ou a busca.",
    forOwnersTitle: "Para proprietários",
    forOwnersText:
      "Visualizam de forma simples quais países correm em cada dia e entram no detalhe de cada jornada.",
    forMarketTitle: "Para mercado",
    forMarketText:
      "Permite conectar calendários de corridas com bloodstock, fichas, performances e análises.",
    forAnalysisTitle: "Para análise",
    forAnalysisText:
      "Depois é possível adicionar alertas, favoritos, resultados históricos e estatísticas avançadas.",
    raceLabel: "Corrida",
    time: "Hora",
    surface: "Pista",
    distance: "Distância",
    purse: "Bolsa",
    entries: "Inscritos",
    horses: "cavalos",
    pending: "Pendente",
    viewRaceDetail: "Ver detalhe da corrida",
    statusLabels: {
      Programada: "Programada",
      Confirmada: "Confirmada",
      "Inscripciones abiertas": "Inscrições abertas",
    },
    cards: [
      {
        title: "Programas",
        text: "Futuros programas de corridas e inscrições internacionais.",
      },
      {
        title: "Resultados",
        text: "Resultados, vencedores e informações de cada corrida.",
      },
      {
        title: "Ratings",
        text: "Ratings, dados de performance e futuras ferramentas de corridas.",
      },
    ],
  },
  en: {
    kicker: "Racing module",
    brand: "Lineage Races",
    title: "Races",
    intro:
      "Racecards, results, international entries, ratings and race information.",
    selectedDay: "Selected day",
    countries: "Countries",
    tracks: "Racecourses",
    races: "Races",
    noRacesDay:
      "There are no races loaded for this day. You can choose another day on the calendar or use the highlighted upcoming days.",
    statsDays: "Days with races",
    statsCountries: "Calendar countries",
    statsTracks: "Active racecourses",
    statsRaces: "Loaded races",
    calendar: "Calendar",
    noRacesShort: "No races",
    upcomingDays: "Upcoming days",
    featuredRaces: "Featured races",
    racesCount: "races",
    nextStageTitle: "Next Lineage stage",
    nextStageText:
      "Each race day can connect with entries, results, videos, horse profiles, jockeys, trainers, studs, statistics and editorial reports.",
    dayDetail: "Day detail",
    racesIn: "There are races in",
    searchPlaceholder: "Search race, racecourse, country...",
    allCountries: "All countries",
    noLoadedTitle: "This day does not have races loaded yet",
    noLoadedText:
      "Choose another day on the calendar. Days with races show race counts and available countries.",
    noFilterTitle: "No results for those filters",
    noFilterText: "Try changing the country or search.",
    forOwnersTitle: "For owners",
    forOwnersText:
      "They can quickly see which countries are racing each day and open each race day detail.",
    forMarketTitle: "For the market",
    forMarketText:
      "Connect racing calendars with bloodstock, horse profiles, performances and analysis.",
    forAnalysisTitle: "For analysis",
    forAnalysisText:
      "Alerts, favorites, historical results and advanced statistics can be added later.",
    raceLabel: "Race",
    time: "Time",
    surface: "Surface",
    distance: "Distance",
    purse: "Purse",
    entries: "Entries",
    horses: "horses",
    pending: "Pending",
    viewRaceDetail: "View race detail",
    statusLabels: {
      Programada: "Scheduled",
      Confirmada: "Confirmed",
      "Inscripciones abiertas": "Entries open",
    },
    cards: [
      {
        title: "Racecards",
        text: "Future racecards and international entries.",
      },
      {
        title: "Results",
        text: "Results, winners and race information.",
      },
      {
        title: "Ratings",
        text: "Ratings, performance data and future racing tools.",
      },
    ],
  },
};

const RACE_DAYS = [
  {
    date: "2026-04-29",
    countries: [
      {
        country: "Uruguay",
        countryCode: "UY",
        tracks: [
          {
            track: "Hipódromo Nacional de Maroñas",
            city: "Montevideo",
            races: [
              {
                id: "uy-20260429-1",
                raceNumber: 1,
                name: "Premio Apertura",
                time: "14:30",
                category: "Condicional",
                surface: "Arena",
                distance: "1200 m",
                ageCondition: "Todo caballo de 3 años y más edad",
                purse: "USD 7.500",
                status: "Programada",
                entries: 10,
              },
              {
                id: "uy-20260429-2",
                raceNumber: 2,
                name: "Premio Sprinter",
                time: "15:05",
                category: "Handicap",
                surface: "Arena",
                distance: "1400 m",
                ageCondition: "Yeguas de 4 años y más edad",
                purse: "USD 8.200",
                status: "Programada",
                entries: 8,
              },
              {
                id: "uy-20260429-3",
                raceNumber: 3,
                name: "Clásico Especial",
                time: "16:20",
                category: "Clásico",
                surface: "Arena",
                distance: "1600 m",
                ageCondition: "Productos de 3 años",
                purse: "USD 15.000",
                status: "Confirmada",
                entries: 12,
              },
            ],
          },
        ],
      },
      {
        country: "Brasil",
        countryCode: "BR",
        tracks: [
          {
            track: "Hipódromo da Gávea",
            city: "Rio de Janeiro",
            races: [
              {
                id: "br-20260429-1",
                raceNumber: 1,
                name: "Grande Prêmio de Abertura",
                time: "15:00",
                category: "Especial",
                surface: "Césped",
                distance: "1500 m",
                ageCondition: "Produtos de 3 anos",
                purse: "BRL 42.000",
                status: "Programada",
                entries: 11,
              },
              {
                id: "br-20260429-2",
                raceNumber: 2,
                name: "Prova Especial Cidade",
                time: "16:10",
                category: "Listed",
                surface: "Césped",
                distance: "2000 m",
                ageCondition: "Todo cavalo de 4 anos e mais",
                purse: "BRL 55.000",
                status: "Programada",
                entries: 9,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    date: "2026-05-03",
    countries: [
      {
        country: "Estados Unidos",
        countryCode: "USA",
        tracks: [
          {
            track: "Keeneland",
            city: "Lexington, Kentucky",
            races: [
              {
                id: "usa-20260503-1",
                raceNumber: 1,
                name: "Allowance Feature",
                time: "13:05",
                category: "Allowance",
                surface: "Dirt",
                distance: "1 Mile",
                ageCondition: "3 years old and upward",
                purse: "USD 120.000",
                status: "Programada",
                entries: 10,
              },
              {
                id: "usa-20260503-2",
                raceNumber: 2,
                name: "Kentucky Sprint Preview",
                time: "14:15",
                category: "Stakes",
                surface: "Dirt",
                distance: "6 Furlongs",
                ageCondition: "Fillies and mares",
                purse: "USD 180.000",
                status: "Confirmada",
                entries: 8,
              },
            ],
          },
        ],
      },
      {
        country: "Uruguay",
        countryCode: "UY",
        tracks: [
          {
            track: "Hipódromo Nacional de Maroñas",
            city: "Montevideo",
            races: [
              {
                id: "uy-20260503-1",
                raceNumber: 1,
                name: "Clásico José Serrato",
                time: "15:30",
                category: "Clásico",
                surface: "Arena",
                distance: "1600 m",
                ageCondition: "Todo caballo de 3 años y más edad",
                purse: "USD 18.000",
                status: "Programada",
                entries: 13,
              },
              {
                id: "uy-20260503-2",
                raceNumber: 2,
                name: "Premio Potrancas",
                time: "16:05",
                category: "Condicional",
                surface: "Arena",
                distance: "1200 m",
                ageCondition: "Potrancas de 2 años",
                purse: "USD 9.000",
                status: "Programada",
                entries: 7,
              },
            ],
          },
        ],
      },
      {
        country: "Chile",
        countryCode: "CL",
        tracks: [
          {
            track: "Club Hípico de Santiago",
            city: "Santiago",
            races: [
              {
                id: "cl-20260503-1",
                raceNumber: 1,
                name: "Clásico Criadores",
                time: "14:45",
                category: "Clásico",
                surface: "Césped",
                distance: "1800 m",
                ageCondition: "Productos de 3 años",
                purse: "CLP 18.000.000",
                status: "Programada",
                entries: 14,
              },
            ],
          },
        ],
      },
      {
        country: "Perú",
        countryCode: "PE",
        tracks: [
          {
            track: "Hipódromo de Monterrico",
            city: "Lima",
            races: [
              {
                id: "pe-20260503-1",
                raceNumber: 1,
                name: "Premio Selectivo",
                time: "18:20",
                category: "Condicional",
                surface: "Arena",
                distance: "1200 m",
                ageCondition: "Caballos de 3 años",
                purse: "PEN 28.000",
                status: "Programada",
                entries: 9,
              },
              {
                id: "pe-20260503-2",
                raceNumber: 2,
                name: "Clásico Nacional",
                time: "19:10",
                category: "Clásico",
                surface: "Arena",
                distance: "2000 m",
                ageCondition: "Todo caballo",
                purse: "PEN 45.000",
                status: "Inscripciones abiertas",
                entries: 0,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    date: "2026-05-06",
    countries: [
      {
        country: "Argentina",
        countryCode: "ARG",
        tracks: [
          {
            track: "Hipódromo de San Isidro",
            city: "Buenos Aires",
            races: [
              {
                id: "arg-20260506-1",
                raceNumber: 1,
                name: "Premio Especial Potrillos",
                time: "16:10",
                category: "Especial",
                surface: "Césped",
                distance: "1400 m",
                ageCondition: "Potrillos de 2 años",
                purse: "ARS 9.000.000",
                status: "Programada",
                entries: 12,
              },
            ],
          },
        ],
      },
      {
        country: "Panamá",
        countryCode: "PA",
        tracks: [
          {
            track: "Hipódromo Presidente Remón",
            city: "Ciudad de Panamá",
            races: [
              {
                id: "pa-20260506-1",
                raceNumber: 1,
                name: "Clásico Internacional",
                time: "16:30",
                category: "Clásico",
                surface: "Arena",
                distance: "1800 m",
                ageCondition: "Todo caballo de 3 años y más",
                purse: "USD 35.000",
                status: "Programada",
                entries: 10,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    date: "2026-05-10",
    countries: [
      {
        country: "Inglaterra",
        countryCode: "UK",
        tracks: [
          {
            track: "Ascot Racecourse",
            city: "Ascot",
            races: [
              {
                id: "uk-20260510-1",
                raceNumber: 1,
                name: "Royal Trial Stakes",
                time: "15:40",
                category: "Listed",
                surface: "Césped",
                distance: "1600 m",
                ageCondition: "3 years old and upward",
                purse: "GBP 90.000",
                status: "Programada",
                entries: 11,
              },
            ],
          },
        ],
      },
      {
        country: "Irlanda",
        countryCode: "IRE",
        tracks: [
          {
            track: "The Curragh",
            city: "Kildare",
            races: [
              {
                id: "ire-20260510-1",
                raceNumber: 1,
                name: "Irish Classic Trial",
                time: "16:00",
                category: "G2",
                surface: "Césped",
                distance: "2000 m",
                ageCondition: "3 years old",
                purse: "EUR 120.000",
                status: "Inscripciones abiertas",
                entries: 0,
              },
            ],
          },
        ],
      },
      {
        country: "Francia",
        countryCode: "FR",
        tracks: [
          {
            track: "ParisLongchamp",
            city: "París",
            races: [
              {
                id: "fr-20260510-1",
                raceNumber: 1,
                name: "Prix de Printemps",
                time: "15:15",
                category: "G3",
                surface: "Césped",
                distance: "2100 m",
                ageCondition: "3 ans et plus",
                purse: "EUR 80.000",
                status: "Programada",
                entries: 13,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    date: "2026-05-15",
    countries: [
      {
        country: "España",
        countryCode: "ES",
        tracks: [
          {
            track: "Hipódromo de La Zarzuela",
            city: "Madrid",
            races: [
              {
                id: "es-20260515-1",
                raceNumber: 1,
                name: "Gran Premio Nacional",
                time: "12:30",
                category: "Gran Premio",
                surface: "Césped",
                distance: "2200 m",
                ageCondition: "Caballos nacionales de 3 años",
                purse: "EUR 45.000",
                status: "Programada",
                entries: 10,
              },
            ],
          },
        ],
      },
      {
        country: "Sudáfrica",
        countryCode: "SA",
        tracks: [
          {
            track: "Kenilworth Racecourse",
            city: "Cape Town",
            races: [
              {
                id: "sa-20260515-1",
                raceNumber: 1,
                name: "Cape Feature Stakes",
                time: "14:00",
                category: "G1",
                surface: "Césped",
                distance: "1600 m",
                ageCondition: "3 years old and upward",
                purse: "ZAR 1.000.000",
                status: "Programada",
                entries: 16,
              },
            ],
          },
        ],
      },
    ],
  },
];

const STATUS_STYLES = {
  Programada: "bg-[#F1F6EF] text-[#2F5B3B] border-[#2F5B3B]/15",
  Confirmada: "bg-[#F2F4F7] text-[#273B54] border-[#273B54]/15",
  "Inscripciones abiertas": "bg-[#7A1F2B]/[0.06] text-[#7A1F2B] border-[#7A1F2B]/15",
};

function toLocalDate(dateString) {
  return new Date(`${dateString}T12:00:00`);
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFullDate(dateString, language = "es") {
  const date = toLocalDate(dateString);

  return new Intl.DateTimeFormat(LANGUAGE_LOCALE[language] || LANGUAGE_LOCALE.es, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(dateString, language = "es") {
  const date = toLocalDate(dateString);

  return new Intl.DateTimeFormat(LANGUAGE_LOCALE[language] || LANGUAGE_LOCALE.es, {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getTotalRaces(day) {
  if (!day) return 0;

  return day.countries.reduce((total, country) => {
    return (
      total +
      country.tracks.reduce((trackTotal, track) => {
        return trackTotal + track.races.length;
      }, 0)
    );
  }, 0);
}

function getTotalTracks(day) {
  if (!day) return 0;

  return day.countries.reduce((total, country) => {
    return total + country.tracks.length;
  }, 0);
}

function getDayCountryNames(day) {
  if (!day) return [];

  return day.countries.map((item) => item.country);
}

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstWeekDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const totalDays = lastDay.getDate();

  const days = [];

  for (let i = 0; i < firstWeekDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export default function CarrerasPage() {
  const { language } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;
  const monthNames = MONTH_NAMES[language] || MONTH_NAMES.es;
  const weekDays = WEEK_DAYS[language] || WEEK_DAYS.es;
  const todayKey = "2026-04-29";

  const [calendarDate, setCalendarDate] = useState(toLocalDate(todayKey));
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const calendarDays = useMemo(() => {
    return buildCalendarDays(year, month);
  }, [year, month]);

  const raceDayByDate = useMemo(() => {
    const map = {};

    RACE_DAYS.forEach((day) => {
      map[day.date] = day;
    });

    return map;
  }, []);

  const selectedDay = raceDayByDate[selectedDate] || null;

  const availableCountries = useMemo(() => {
    if (!selectedDay) return [];

    return selectedDay.countries.map((item) => item.country);
  }, [selectedDay]);

  const filteredSelectedDay = useMemo(() => {
    if (!selectedDay) return null;

    const cleanSearch = search.trim().toLowerCase();

    const countries = selectedDay.countries
      .filter((countryGroup) => {
        return (
          selectedCountry === "all" ||
          countryGroup.country === selectedCountry
        );
      })
      .map((countryGroup) => {
        const tracks = countryGroup.tracks
          .map((track) => {
            const races = track.races.filter((race) => {
              const text = [
                countryGroup.country,
                countryGroup.countryCode,
                track.track,
                track.city,
                race.name,
                race.category,
                race.surface,
                race.distance,
                race.ageCondition,
                race.status,
              ]
                .join(" ")
                .toLowerCase();

              return text.includes(cleanSearch);
            });

            return {
              ...track,
              races,
            };
          })
          .filter((track) => track.races.length > 0);

        return {
          ...countryGroup,
          tracks,
        };
      })
      .filter((countryGroup) => countryGroup.tracks.length > 0);

    return {
      ...selectedDay,
      countries,
    };
  }, [selectedDay, search, selectedCountry]);

  const upcomingDays = useMemo(() => {
    return RACE_DAYS.filter((day) => day.date >= todayKey).sort(
      (a, b) => toLocalDate(a.date) - toLocalDate(b.date)
    );
  }, []);

  const selectedTotalRaces = getTotalRaces(selectedDay);
  const selectedTotalTracks = getTotalTracks(selectedDay);

  function goToPreviousMonth() {
    setCalendarDate(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setCalendarDate(new Date(year, month + 1, 1));
  }

  function handleSelectDate(date) {
    const key = toDateKey(date);

    setSelectedDate(key);
    setSearch("");
    setSelectedCountry("all");
  }

  function handleSelectUpcomingDay(date) {
    const parsedDate = toLocalDate(date);

    setCalendarDate(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1));
    setSelectedDate(date);
    setSearch("");
    setSelectedCountry("all");
  }

  return (
    <main className="min-h-screen bg-[#F5F1EA] text-[#16110F]">
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#7A1F2B]/20 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-[#7A1F2B]">
                <Globe2 size={14} />
                {t.brand}
              </div>

              <h1 className="font-serif text-4xl font-normal tracking-tight md:text-6xl">
                {t.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6D625B] md:text-base">
                {t.intro}
              </p>
            </div>

            <div className="rounded-3xl border border-black/5 bg-[#3B0D12] p-5 text-white shadow-sm lg:w-[370px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    {t.selectedDay}
                  </p>
                  <h2 className="mt-2 font-serif text-xl font-normal capitalize">
                    {formatFullDate(selectedDate, language)}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white/10 p-3">
                  <CalendarDays size={22} />
                </div>
              </div>

              {selectedDay ? (
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <DarkStat label={t.countries} value={selectedDay.countries.length} />
                  <DarkStat label={t.tracks} value={selectedTotalTracks} />
                  <DarkStat label={t.races} value={selectedTotalRaces} />
                </div>
              ) : (
                <p className="mt-5 text-sm leading-6 text-white/65">
                  {t.noRacesDay}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<CalendarDays size={19} />}
              label={t.statsDays}
              value={RACE_DAYS.length}
            />
            <StatCard
              icon={<Flag size={19} />}
              label={t.statsCountries}
              value={15}
            />
            <StatCard
              icon={<Building2 size={19} />}
              label={t.statsTracks}
              value={RACE_DAYS.reduce((total, day) => total + getTotalTracks(day), 0)}
            />
            <StatCard
              icon={<Trophy size={19} />}
              label={t.statsRaces}
              value={RACE_DAYS.reduce((total, day) => total + getTotalRaces(day), 0)}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[380px_1fr] lg:px-8">
        <aside className="space-y-5">
          <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8A7D74]">
                  {t.calendar}
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {monthNames[month]} {year}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="rounded-2xl border border-black/10 bg-white p-2 text-[#16110F] transition hover:border-[#7A1F2B]/25 hover:bg-[#7A1F2B]/[0.06] hover:text-[#7A1F2B]"
                  type="button"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="rounded-2xl border border-black/10 bg-white p-2 text-[#16110F] transition hover:border-[#7A1F2B]/25 hover:bg-[#7A1F2B]/[0.06] hover:text-[#7A1F2B]"
                  type="button"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="pb-1 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9B9088]"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-[74px]" />;
                }

                const dateKey = toDateKey(date);
                const dayData = raceDayByDate[dateKey];
                const isSelected = selectedDate === dateKey;
                const isToday = dateKey === todayKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => handleSelectDate(date)}
                    className={`min-h-[74px] rounded-2xl border p-2 text-left transition ${
                      isSelected
                        ? "border-[#7A1F2B]/40 bg-[#7A1F2B]/[0.06] shadow-sm"
                        : dayData
                        ? "border-black/10 bg-white hover:border-[#7A1F2B]/25 hover:bg-[#7A1F2B]/[0.06]"
                        : "border-black/5 bg-[#FBF8F2] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                          isSelected
                            ? "bg-[#7A1F2B] text-white"
                            : isToday
                            ? "bg-[#3B0D12] text-white"
                            : "text-[#16110F]"
                        }`}
                      >
                        {date.getDate()}
                      </span>

                      {dayData && (
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#7A1F2B]">
                          {getTotalRaces(dayData)}
                        </span>
                      )}
                    </div>

                    {dayData ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {getDayCountryNames(dayData)
                          .slice(0, 2)
                          .map((country) => (
                            <span
                              key={country}
                              className="rounded-full bg-[#3B0D12]/5 px-2 py-0.5 text-[10px] font-semibold text-[#6D625B]"
                            >
                              {country}
                            </span>
                          ))}

                        {getDayCountryNames(dayData).length > 2 && (
                          <span className="rounded-full bg-[#7A1F2B]/10 px-2 py-0.5 text-[10px] font-semibold text-[#7A1F2B]">
                            +{getDayCountryNames(dayData).length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-[10px] text-[#B6ACA4]">
                        {t.noRacesShort}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8A7D74]">
                  {t.upcomingDays}
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  {t.featuredRaces}
                </h2>
              </div>

              <ListChecks size={19} className="text-[#7A1F2B]" />
            </div>

            <div className="space-y-2">
              {upcomingDays.map((day) => (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => handleSelectUpcomingDay(day.date)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                    selectedDate === day.date
                      ? "border-[#7A1F2B]/25 bg-[#7A1F2B]/[0.06]"
                      : "border-black/5 bg-[#FBF8F2] hover:border-[#7A1F2B]/25 hover:bg-[#7A1F2B]/[0.06]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold capitalize">
                        {formatShortDate(day.date, language)}
                      </p>
                      <p className="mt-1 text-xs text-[#8A7D74]">
                        {getDayCountryNames(day).join(", ")}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[#7A1F2B]">
                      {getTotalRaces(day)} {t.racesCount}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#7A1F2B]/15 bg-[#7A1F2B]/[0.06] p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-[#7A1F2B]">
              <ArrowUpRight size={20} />
            </div>
            <h3 className="font-semibold text-[#16110F]">
              {t.nextStageTitle}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#7A5140]">
              {t.nextStageText}
            </p>
          </div>
        </aside>

        <section className="space-y-5">
          <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8A7D74]">
                  {t.dayDetail}
                </p>
                <h2 className="mt-1 font-serif text-2xl font-normal capitalize">
                  {formatFullDate(selectedDate, language)}
                </h2>

                {selectedDay ? (
                  <p className="mt-2 text-sm text-[#6D625B]">
                    {t.racesIn}{" "}
                    <span className="font-semibold text-[#16110F]">
                      {getDayCountryNames(selectedDay).join(", ")}
                    </span>
                    .
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-[#6D625B]">
                    {t.noRacesDay}
                  </p>
                )}
              </div>

              {selectedDay && (
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-[#FBF8F2] px-3 py-2">
                    <Search size={17} className="text-[#8A7D74]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full min-w-[240px] bg-transparent text-sm outline-none placeholder:text-[#B6ACA4]"
                    />
                  </div>

                  <select
                    value={selectedCountry}
                    onChange={(event) => setSelectedCountry(event.target.value)}
                    className="rounded-2xl border border-black/10 bg-[#FBF8F2] px-3 py-2 text-sm outline-none transition focus:border-[#7A1F2B]/40 focus:bg-white"
                  >
                    <option value="all">{t.allCountries}</option>
                    {availableCountries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {!selectedDay && (
            <div className="rounded-3xl border border-dashed border-black/10 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#FBF8F2] text-[#8A7D74]">
                <CalendarDays size={24} />
              </div>
              <h3 className="text-lg font-semibold">
                {t.noLoadedTitle}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7A7068]">
                {t.noLoadedText}
              </p>
            </div>
          )}

          {selectedDay && filteredSelectedDay?.countries.length === 0 && (
            <div className="rounded-3xl border border-dashed border-black/10 bg-white p-10 text-center shadow-sm">
              <h3 className="text-lg font-semibold">
                {t.noFilterTitle}
              </h3>
              <p className="mt-2 text-sm text-[#8A7D74]">
                {t.noFilterText}
              </p>
            </div>
          )}

          {filteredSelectedDay?.countries.map((countryGroup) => (
            <CountryRaceBlock
              key={countryGroup.country}
              countryGroup={countryGroup}
              t={t}
            />
          ))}

          {selectedDay && (
            <div className="grid gap-4 md:grid-cols-3">
              <InfoCard
                icon={<Users size={20} />}
                title={t.forOwnersTitle}
                text={t.forOwnersText}
              />
              <InfoCard
                icon={<Route size={20} />}
                title={t.forMarketTitle}
                text={t.forMarketText}
              />
              <InfoCard
                icon={<Star size={20} />}
                title={t.forAnalysisTitle}
                text={t.forAnalysisText}
              />
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function CountryRaceBlock({ countryGroup, t }) {
  const totalRaces = countryGroup.tracks.reduce((total, track) => {
    return total + track.races.length;
  }, 0);

  return (
    <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
      <div className="border-b border-black/5 bg-[#3B0D12] px-5 py-5 text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              <Flag size={14} />
              {countryGroup.countryCode}
            </div>
            <h3 className="font-serif text-2xl font-normal">{countryGroup.country}</h3>
          </div>

          <div className="flex gap-2">
            <SmallDarkPill
              label={t.tracks}
              value={countryGroup.tracks.length}
            />
            <SmallDarkPill label={t.races} value={totalRaces} />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {countryGroup.tracks.map((track) => (
          <div
            key={track.track}
            className="rounded-3xl border border-black/5 bg-[#FBF8F2] p-4"
          >
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#16110F]">
                  <MapPin size={17} className="text-[#7A1F2B]" />
                  {track.track}
                </div>
                <p className="mt-1 text-sm text-[#8A7D74]">{track.city}</p>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#7A1F2B]">
                {track.races.length} {t.racesCount}
              </span>
            </div>

            <div className="grid gap-3">
              {track.races.map((race) => (
                <RaceDetailCard key={race.id} race={race} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RaceDetailCard({ race, t }) {
  return (
    <article className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7A1F2B]/[0.06] text-[#7A1F2B]">
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                {t.raceLabel}
              </p>
              <p className="text-lg font-semibold">{race.raceNumber}</p>
            </div>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={race.status} t={t} />
              <span className="rounded-full border border-black/10 bg-[#FBF8F2] px-3 py-1 text-xs font-semibold text-[#6D625B]">
                {race.category}
              </span>
            </div>

            <h4 className="text-lg font-semibold text-[#16110F]">
              {race.name}
            </h4>

            <p className="mt-1 text-sm leading-6 text-[#7A7068]">
              {race.ageCondition}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <RaceMiniData
            icon={<Clock size={15} />}
            label={t.time}
            value={race.time}
          />
          <RaceMiniData
            icon={<CircleDot size={15} />}
            label={t.surface}
            value={race.surface}
          />
          <RaceMiniData
            icon={<Route size={15} />}
            label={t.distance}
            value={race.distance}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-black/5 pt-4 md:grid-cols-3">
        <BottomData label={t.purse} value={race.purse} />
        <BottomData
          label={t.entries}
          value={race.entries > 0 ? `${race.entries} ${t.horses}` : t.pending}
        />
        <button
          type="button"
          className="flex items-center justify-between rounded-2xl border border-[#7A1F2B]/15 bg-[#7A1F2B]/[0.06] px-4 py-3 text-left text-sm font-semibold text-[#7A1F2B] transition hover:border-[#7A1F2B]/25 hover:bg-[#7A1F2B]/10"
        >
          {t.viewRaceDetail}
          <ChevronRight size={17} />
        </button>
      </div>
    </article>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-[#FBF8F2] p-5">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-white p-3 text-[#7A1F2B] shadow-sm">
          {icon}
        </div>
        <p className="text-3xl font-semibold text-[#16110F]">{value}</p>
      </div>
      <p className="mt-4 text-sm font-medium text-[#6D625B]">{label}</p>
    </div>
  );
}

function DarkStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/50">
        {label}
      </p>
    </div>
  );
}

function SmallDarkPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/50">
        {label}
      </p>
    </div>
  );
}

function StatusBadge({ status, t }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] || "border-black/10 bg-[#F4F1EC] text-[#62584F]"
      }`}
    >
      {t.statusLabels[status] || status}
    </span>
  );
}

function RaceMiniData({ icon, label, value }) {
  return (
    <div className="flex min-w-[115px] items-center gap-2 rounded-2xl border border-black/5 bg-[#FBF8F2] px-3 py-2">
      <div className="text-[#7A1F2B]">{icon}</div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9B9088]">
          {label}
        </p>
        <p className="text-sm font-semibold text-[#16110F]">{value}</p>
      </div>
    </div>
  );
}

function BottomData({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#FBF8F2] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9B9088]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#16110F]">{value}</p>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="mb-4 inline-flex rounded-2xl bg-[#7A1F2B]/[0.06] p-3 text-[#7A1F2B]">
        {icon}
      </div>
      <h3 className="font-semibold text-[#16110F]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6D625B]">{text}</p>
    </div>
  );
}