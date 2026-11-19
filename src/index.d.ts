import type { Country } from "./country.js";
export type { Country } from "./country.js";
export { countries, getCountries, getCountryByCode, findCountry } from "./country.js";
export type City = { code: string; name: string; countryCode: string | null };
/** A country as code (26, "26" or "026"), name ("denmark", "U.A.E", "uae") or a Country object. */
export type CountryInput = number | string | Country;

export const cities: readonly City[];

export function getCityByCode(code: number | string): City | undefined;
/** Without `country` returns the first match; names repeat across countries. */
export function findCity(name: string, country?: CountryInput): City | undefined;
/** Cities of a country, sorted by name; the first `limit` only when given. Unknown country -> []. */
export function getCities(country: CountryInput, options?: { limit?: number }): City[];
/** Autocomplete: starts-with matches first, then contains. Default limit 20. */
export function searchCities(query: string, options?: { country?: CountryInput; limit?: number }): City[];
/** The exact code strings to send to Asia Insurance ("01", leading zeros kept); each is undefined when not found. */
export function getCodes(input?: { country?: CountryInput; city?: string }): {
  countryCode: string | undefined;
  cityCode: string | undefined;
};
