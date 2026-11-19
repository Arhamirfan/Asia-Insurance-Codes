export type Country = { code: number; name: string };

export const countries: readonly Country[];
/** All countries sorted by name, e.g. for a dropdown. Returns a new array each call. */
export function getCountries(): Country[];
export function getCountryByCode(code: number | string): Country | undefined;
export function findCountry(name: string): Country | undefined;
