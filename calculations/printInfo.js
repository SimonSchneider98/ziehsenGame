import { getAllOptions } from "./calculateAllOptions.js";
import {
  loadPreviousStarters,
  loadStartersFromDir,
  printMatrices,
} from "./utils.js";
import fs from "fs";
import path from "path";

const printAllOptions = (amountOfZiehsen) => {
  const previousOptions = getAllOptions(amountOfZiehsen, true);
  // printMatrices(previousOptions);
};

const printAllStarters = (amountOfZiehsen) => {
  const previousStarters = loadPreviousStarters(amountOfZiehsen + 1);
  printMatrices(previousStarters);
};

const printAllReactStarters = () => {
  const reactStarters = loadStartersFromDir("../ziehsenGameReact/src/starters");
  printMatrices(reactStarters);
};

const deleteReactStartersWithTooFewColumns = (minColumns = 3) => {
  const startersDir = "../ziehsenGameReact/src/starters";
  const pattern = /^\d+-\d+\.json$/;

  const files = fs
    .readdirSync(startersDir)
    .filter((name) => pattern.test(name));

  let deleted = 0;
  files.forEach((name) => {
    const filePath = path.join(startersDir, name);
    const matrix = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const usedColumns = matrix.filter((column) => column.includes(true)).length;

    if (usedColumns < minColumns) {
      fs.rmSync(filePath);
      deleted++;
    }
  });

  console.log(`Deleted ${deleted} of ${files.length} files.`);
};

const printAllStarterDistributions = (amountOfZiehsen) => {
  const previousStarters = loadPreviousStarters(amountOfZiehsen + 1);
  const distribution = previousStarters.reduce((acc, curr) => {
    const ziehsen = curr.length;
    if (acc[ziehsen]) acc[ziehsen]++;
    else acc[ziehsen] = 1;
    return acc;
  }, {});

  console.log(
    Object.keys(distribution)
      .map((key) => `${key}: ${distribution[key]}`)
      .join("\n"),
  );
};

// printAllOptions(3);
// printAllStarters(10);
printAllReactStarters();
// deleteReactStartersWithTooFewColumns(3);
// printAllStarterDistributions(20);
