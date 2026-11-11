# asia-insurance-codes

Look up Asia Insurance country and city codes. Zero dependencies, works in Node 22+ and any bundler (React, Next, Vite).

```js
import { getCodes, getCities, findCity, findCountry, searchCities } from "asia-insurance-codes";

// The values to send to Asia Insurance
getCodes({ country: "denmark", city: "Aalborg" });   // { countryCode: 26, cityCode: 4704 }
getCodes({ city: "Aalborg" });                       // country inferred from the city

// A country can be a name or a code, anywhere a country is accepted
getCities("Denmark");        // cities of Denmark, sorted by name
getCities(26);  getCities("26");

findCity("Aalborg", "Denmark")?.code;   // 4704 (pass the country: names repeat across countries)
findCountry("UAE")?.code;               // 74

// Autocomplete for a city input (starts-with first, then contains; default limit 20)
searchCities("aal", { country: "Denmark", limit: 10 });
```

Also: `getCountryByCode`, `getCityByCode`, and the frozen arrays `countries` / `cities`.

## Matching rules
- Names ignore case, accents, punctuation and extra spaces: `"  u.a.e "` = `UAE`, `"a coruna"` = `A CORUÑA`.
- Real-world spellings map to Asia Insurance's (HONGKONG, NETHERLAND, SINGAPURE, COMBODIA...): `Hong Kong`, `Singapore`, `Cambodia`, `UAE`, `United Arab Emirates`, `Netherlands`, `Holland`, `United States`, `USA`, `UK`, `Great Britain`, `Czechia`, `Turkiye`. Add more in `ALIASES` in `src/index.js`.
- A country passed as digits (`26`, `"26"`) is a code; anything else is a name.
- Not found: `undefined` (single lookups, and each field of `getCodes`) or `[]` (list lookups). Never throws.

## Data
Source: Asia Insurance `Country and Cities.xls`. Refresh: regenerate the JSONs (`py convert_xls_to_json.py`), copy them into `data/`, run `npm run build:data`.

Known quirks in the source data: 1,599 cities reference country codes missing from the country list (`getCities(26)`-style lookups by code still return them, by name they can't resolve); 11 cities have no country code (never returned by `getCities`); 194 city names exist in several countries; country 10 `KOREA` vs 111 `SOUTH KOREA` and 25 `NETHERLAND` vs 46 `HOLAND` both exist.
