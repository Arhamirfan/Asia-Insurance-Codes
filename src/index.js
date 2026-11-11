import countryRows from "./countries.js";
import cityRows from "./cities.js";

export const countries = Object.freeze(countryRows);
export const cities = Object.freeze(cityRows);

// Case, accents, punctuation and extra spaces don't matter: "  u.a.e " === "UAE", "Coruña" === "coruna".
const norm = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

// Asia Insurance spells some names oddly (HONGKONG, NETHERLAND, SINGAPURE, COMBODIA); real-world spellings map to their codes.
const ALIASES = {
  "united arab emirates": 74, "hong kong": 113, netherlands: 25, holland: 46, singapore: 121,
  cambodia: 123, "united states": 85, "united states of america": 85, america: 85,
  uk: 52, "great britain": 52, britain: 52, czechia: 64, turkiye: 87,
};

const num = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));
const cmp = new Intl.Collator().compare;
const byName = (a, b) => cmp(a.name, b.name);

const countryByCode = new Map(countries.map((c) => [c.code, c]));
const cityByCode = new Map(cities.map((c) => [c.code, c]));
const countryByName = new Map();
for (const c of countries) if (!countryByName.has(norm(c.name))) countryByName.set(norm(c.name), c);
for (const [alias, code] of Object.entries(ALIASES)) countryByName.set(alias, countryByCode.get(code));

const citiesByName = new Map();
const citiesByCountry = new Map();
const push = (m, k, v) => (m.get(k) ?? m.set(k, []).get(k)).push(v);
for (const c of cities) {
  push(citiesByName, norm(c.name), c);
  if (c.countryCode !== null) push(citiesByCountry, c.countryCode, c);
}
for (const list of citiesByCountry.values()) list.sort(byName);

export const getCountryByCode = (code) => countryByCode.get(num(code));
export const findCountry = (name) => countryByName.get(norm(name));
export const getCityByCode = (code) => cityByCode.get(num(code));

/** A country given as code (1, "1"), name ("india") or a Country object -> numeric code, else NaN. */
function toCountryCode(country) {
  if (country && typeof country === "object") return num(country.code);
  if (typeof country === "number" || /^\s*\d+\s*$/.test(country ?? "")) return num(country);
  return findCountry(country)?.code ?? NaN;
}

export const getCities = (country) => [...(citiesByCountry.get(toCountryCode(country)) ?? [])];

export function findCity(name, country) {
  const list = citiesByName.get(norm(name)) ?? [];
  if (country === undefined) return list[0];
  const cc = toCountryCode(country);
  return list.find((c) => c.countryCode === cc);
}

/** Autocomplete: names starting with the query first, then names containing it. */
export function searchCities(query, { country, limit = 20 } = {}) {
  const q = norm(query);
  if (!q) return [];
  const pool = country === undefined ? cities : getCities(country);
  const starts = [], inside = [];
  for (const c of pool) {
    const n = norm(c.name);
    if (n.startsWith(q)) starts.push(c);
    else if (n.includes(q)) inside.push(c);
  }
  return [...starts.sort(byName), ...inside.sort(byName)].slice(0, limit);
}

/** The values to send to Asia Insurance: { countryCode, cityCode }, each undefined if not found. */
export function getCodes({ country, city } = {}) {
  const cc = country === undefined ? NaN : toCountryCode(country);
  const c = city === undefined ? undefined : findCity(city, country);
  return {
    countryCode: Number.isNaN(cc) ? c?.countryCode ?? undefined : cc,
    cityCode: c?.code,
  };
}
