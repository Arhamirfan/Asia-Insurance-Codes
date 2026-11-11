import { readFileSync, writeFileSync } from "node:fs";

for (const name of ["countries", "cities"]) {
  const rows = JSON.parse(readFileSync(`data/${name}.json`, "utf8"));
  writeFileSync(`src/${name}.js`, `export default ${JSON.stringify(rows)};\n`);
}
