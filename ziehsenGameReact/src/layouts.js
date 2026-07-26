// Loads all layout JSON files from src/starters and exposes them as a sorted
// list with a stable display number (1..N) and the count of active tiles.
const modules = import.meta.glob("./starters/*.json", { eager: true });

function parse(path, mod) {
  const file = path.split("/").pop(); // e.g. "10-2.json"
  const name = file.replace(/\.json$/, ""); // e.g. "10-2"
  const [size, variant] = name.split("-").map(Number);
  const matrix = mod.default ?? mod;
  const ziehsen = matrix.reduce(
    (total, column) => total + column.filter(Boolean).length,
    0,
  );
  return { file, name, size, variant, matrix, ziehsen };
}

export const layouts = Object.entries(modules)
  .map(([path, mod]) => parse(path, mod))
  .sort((a, b) => a.size - b.size || a.variant - b.variant)
  .map((layout, index) => ({ ...layout, number: index + 1 }));

export function getLayout(name) {
  return layouts.find((layout) => layout.name === name);
}
