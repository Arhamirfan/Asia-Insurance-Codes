import test from "node:test";
import assert from "node:assert/strict";
import {
  countries, cities, getCountryByCode, findCountry, getCityByCode, findCity, getCities, searchCities, getCodes,
} from "../src/index.js";

test("countries", () => {
  assert.deepEqual(getCountryByCode(1), { code: 1, name: "PAKISTAN" });
  assert.equal(getCountryByCode("2").name, "INDIA");
  assert.equal(findCountry("  india ")?.code, 2);
  assert.equal(findCountry("Atlantis"), undefined);
});

test("cities by code and name", () => {
  assert.equal(getCityByCode(4704).name, "AALBORG");
  assert.equal(getCityByCode(9495), undefined); // nameless row dropped
  assert.equal(findCity("aalborg")?.countryCode, 26);
});

test("duplicate names resolve by country", () => {
  const seen = new Map();
  for (const c of cities) seen.set(c.name.toLowerCase(), (seen.get(c.name.toLowerCase()) ?? 0) + 1);
  const dups = cities.filter((c) => seen.get(c.name.toLowerCase()) > 1 && c.countryCode !== null);
  assert.ok(dups.length > 0);
  for (const c of dups) assert.equal(findCity(c.name, c.countryCode).countryCode, c.countryCode);
});

test("getCities", () => {
  const list = getCities(26);
  assert.ok(list.length > 0 && list.every((c) => c.countryCode === 26));
  assert.deepEqual(getCities("26"), list);
  const known = new Set(countries.map((c) => c.code));
  const orphan = cities.find((c) => c.countryCode !== null && !known.has(c.countryCode));
  assert.ok(getCities(orphan.countryCode).length > 0);
});

test("cities with null countryCode", () => {
  const nul = cities.find((c) => c.countryCode === null);
  assert.equal(getCityByCode(nul.code), nul);
  for (const n of [1, 2, 26, 16]) assert.ok(getCities(n).every((c) => c.countryCode !== null));
});

test("junk input never throws", () => {
  for (const x of [undefined, null, NaN, "abc", ""]) {
    assert.equal(getCountryByCode(x), undefined);
    assert.equal(getCityByCode(x), undefined);
    assert.deepEqual(getCities(x), []);
  }
  assert.equal(findCity(""), undefined);
  assert.equal(findCountry(""), undefined);
  assert.equal(findCity(undefined), undefined);
});

test("data is frozen", () => {
  assert.ok(Object.isFrozen(countries) && Object.isFrozen(cities));
});

test("country by name instead of code, any case/spacing/punctuation", () => {
  const byCode = getCities(26);
  for (const input of ["denmark", "DENMARK", "  Denmark  ", { code: 26, name: "x" }]) {
    assert.deepEqual(getCities(input), byCode);
  }
  assert.equal(findCountry("u.a.e")?.code, 74);
  assert.equal(findCountry("UAE")?.code, 74);
  assert.deepEqual(getCities("Atlantis"), []);
});

test("real-world aliases map to Asia Insurance spellings", () => {
  const exp = { "hong kong": 113, netherlands: 25, holland: 46, singapore: 121, cambodia: 123,
    "united states": 85, "United Arab Emirates": 74, UK: 52, czechia: 64, turkiye: 87 };
  for (const [name, code] of Object.entries(exp)) assert.equal(findCountry(name)?.code, code, name);
});

test("accents are ignored in names", () => {
  assert.equal(findCity("a coruna province")?.name, "A CORUÑA PROVINCE");
});

test("getCities is sorted by name", () => {
  const names = getCities("india").map((c) => c.name);
  assert.deepEqual(names, [...names].sort(new Intl.Collator().compare));
});

test("findCity accepts country name", () => {
  assert.equal(findCity("aalborg", "denmark")?.code, 4704);
  assert.equal(findCity("aalborg", "india"), undefined);
  assert.equal(findCity("aalborg", null), undefined);
});

test("searchCities autocomplete", () => {
  const r = searchCities("aal", { country: "denmark" });
  assert.ok(r.length > 0 && r.length <= 20 && r.every((c) => c.countryCode === 26));
  assert.equal(r[0].name.toLowerCase().startsWith("aal"), true);
  assert.equal(searchCities("aal", { limit: 3 }).length, 3);
  assert.deepEqual(searchCities(""), []);
  assert.deepEqual(searchCities("zzzzqqq"), []);
  assert.deepEqual(searchCities("aal", { country: "Atlantis" }), []);
});

test("getCodes returns the values to send", () => {
  assert.deepEqual(getCodes({ country: "Denmark", city: "aalborg" }), { countryCode: 26, cityCode: 4704 });
  assert.deepEqual(getCodes({ country: "denmark" }), { countryCode: 26, cityCode: undefined });
  assert.deepEqual(getCodes({ city: "aalborg" }), { countryCode: 26, cityCode: 4704 });
  assert.deepEqual(getCodes({ country: "Atlantis", city: "aalborg" }), { countryCode: undefined, cityCode: undefined });
  assert.deepEqual(getCodes({ country: 26, city: "nowhere" }), { countryCode: 26, cityCode: undefined });
  assert.deepEqual(getCodes(), { countryCode: undefined, cityCode: undefined });
});
