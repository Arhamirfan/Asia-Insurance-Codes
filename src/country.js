// Countries only: never imports cities.js, so frontends can load this without the ~535 KB city list.
import countryRows from "./countries.js";

export const countries = Object.freeze(countryRows);

// Case, accents, punctuation and extra spaces don't matter: "  u.a.e " === "UAE", "Coruña" === "coruna".
export const norm = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

// Codes are kept as strings ("01"); lookups key by numeric value so 1, "1" and "01" all match.
// Safe: no two codes share a numeric value in the source data.
export const num = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));
export const byName = (a, b) => cmp(a.name, b.name);
const cmp = new Intl.Collator().compare;

// Asia Insurance spells some names oddly (HONGKONG, NETHERLAND, SINGAPURE, COMBODIA); real-world spellings map to their codes.
const ALIASES = {
  "united arab emirates": 74, "hong kong": 113, netherlands: 25, holland: 46, singapore: 121,
  cambodia: 123, "united states": 85, "united states of america": 85, america: 85,
  uk: 52, "great britain": 52, britain: 52, czechia: 64, turkiye: 87,
};

const countryByCode = new Map(countries.map((c) => [num(c.code), c]));
const countryByName = new Map();
for (const c of countries) if (!countryByName.has(norm(c.name))) countryByName.set(norm(c.name), c);
for (const [alias, code] of Object.entries(ALIASES)) countryByName.set(alias, countryByCode.get(num(code)));

const sortedCountries = [...countries].sort(byName);

/** All countries sorted by name, e.g. for a dropdown. */
export const getCountries = () => [...sortedCountries];
export const getCountryByCode = (code) => countryByCode.get(num(code));
export const findCountry = (name) => countryByName.get(norm(name));
