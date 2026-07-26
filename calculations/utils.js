export {
  getMatrixCopy,
  getColumnCopy,
  matricesAreEqual,
  printMatrices,
  loadPreviousStarters,
  loadStartersFromDir,
};

import fs from "fs";
import path from "path";

const getMatrixCopy = (matrix) => {
  const copy = [];

  for (let i = 0; i < matrix.length; i++) {
    let column = [];
    for (let j = 0; j < matrix[i].length; j++) column.push(matrix[i][j]);
    copy.push(column);
  }

  return copy;
};

const getColumnCopy = (column) => {
  const size = column.length;
  const copy = [];

  for (let i = 0; i < size; i++) {
    copy.push(column[i]);
  }

  return copy;
};

const matricesAreEqual = (m1, m2) => {
  const normalizedM1 = m1.filter((column) => column.includes(true));
  const normalizedM2 = m2.filter((column) => column.includes(true));

  if (normalizedM1.length !== normalizedM2.length) return false;

  const normalizedM1Copy = getMatrixCopy(normalizedM1);
  const normalizedM2Copy = getMatrixCopy(normalizedM2);

  for (let i = 0; i < normalizedM1Copy.length; i++) {
    const equalColumnIndex = normalizedM2Copy.findIndex((m2Column) =>
      columnsAreEqual(normalizedM1Copy[i], m2Column),
    );
    if (equalColumnIndex === -1) return false;
    normalizedM2Copy.splice(equalColumnIndex, 1);
  }

  return true;
};

const columnsAreEqual = (c1, c2) => {
  const l1 = c1.filter((cell) => cell).length;
  const l2 = c2.filter((cell) => cell).length;

  const result =
    c1.filter((cell) => cell).length === c2.filter((cell) => cell).length;

  return result;
};

const printMatrices = (matrices) => {
  console.log("Count:", matrices.length);

  const ziehsenFileCounts = {};

  matrices.forEach((matrix, i) => {
    const ziehsen = matrix.length;
    ziehsenFileCounts[ziehsen] = (ziehsenFileCounts[ziehsen] || 0) + 1;

    const nonEmptyColumns = matrix.filter((column) => column.includes(true));
    const rowCount = matrix[0].length;
    const nonEmptyRowIndices = [];
    for (let row = 0; row < rowCount; row++) {
      if (nonEmptyColumns.some((column) => column[row])) {
        nonEmptyRowIndices.push(row);
      }
    }

    const cols = nonEmptyColumns.length;

    console.log("--" + "----".repeat(cols));
    console.log(
      i + 1 + " (" + ziehsen + " #" + ziehsenFileCounts[ziehsen] + ")" + "\n",
    );

    nonEmptyRowIndices.forEach((row) => {
      const line = nonEmptyColumns.map((column) => column[row]);
      console.log(
        "| " + line.map((cell) => (cell ? "x" : "-")).join(" | ") + " |",
      );
    });

    console.log("\n--" + "----".repeat(cols));
  });
};

const loadPreviousStarters = (amountOfZiehsen) => {
  const previousStarters = [];
  for (let i = 1; i < amountOfZiehsen; i++) {
    const starters = loadStarters(i);
    starters.forEach((starter) => previousStarters.push(starter));
  }

  return previousStarters;
};

const loadStartersFromDir = (startersDir) => {
  const pattern = /^(\d+)-(\d+)\.json$/;

  return fs
    .readdirSync(startersDir)
    .filter((name) => pattern.test(name))
    .sort((a, b) => {
      const [, ziehsenA, indexA] = a.match(pattern).map(Number);
      const [, ziehsenB, indexB] = b.match(pattern).map(Number);
      return ziehsenA - ziehsenB || indexA - indexB;
    })
    .map((name) =>
      JSON.parse(fs.readFileSync(path.join(startersDir, name), "utf8")),
    );
};

const loadStarters = (amountOfZiehsen) => {
  const startersDir = "./starters";
  const pattern = new RegExp(`^${amountOfZiehsen}-\\d+\\.json$`);

  const starters = fs
    .readdirSync(startersDir)
    .filter((name) => pattern.test(name))
    .map((name) =>
      JSON.parse(fs.readFileSync(path.join(startersDir, name), "utf8")),
    );

  if (amountOfZiehsen !== 2 && starters.length === 0)
    throw "starterfile not found: " + amountOfZiehsen;

  return starters;
};
