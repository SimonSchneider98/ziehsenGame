export {
  getMatrixCopy,
  getColumnCopy,
  matricesAreEqual,
  printMatrices,
  loadPreviousStarters,
};

import fs from "fs";
import path from "path";

const getMatrixCopy = (matrix) => {
  const size = matrix.length;
  const copy = [];

  for (let i = 0; i < size; i++) {
    let column = [];
    for (let j = 0; j < size; j++) column.push(matrix[i][j]);
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
  const m1Copy = getMatrixCopy(m1).filter((column) => column.includes(true));
  const m2Copy = getMatrixCopy(m2).filter((column) => column.includes(true));

  for (let i = 0; i < m1Copy.length; i++) {
    const equalColumnIndex = m2Copy.findIndex((m2Column) =>
      columnsAreEqual(m1Copy[i], m2Column)
    );
    if (equalColumnIndex === -1) return false;
    m2Copy.splice(equalColumnIndex, 1);
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

  matrices.forEach((matrix, i) => {
    const rows = matrix.length;
    const cols = matrix[0].length;

    console.log("--" + "----".repeat(cols));
    console.log(i + 1 + " (" + matrix.length + ")" + "\n");

    for (let col = 0; col < cols; col++) {
      let line = [];
      for (let row = 0; row < rows; row++) {
        line.push(matrix[row][col]);
      }
      console.log(
        "| " + line.map((cell) => (cell ? "x" : "-")).join(" | ") + " |"
      );
    }

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

const loadStarters = (amountOfZiehsen) => {
  const startersDir = "./starters";
  const pattern = new RegExp(`^${amountOfZiehsen}-\\d+\\.json$`);

  const starters = fs
    .readdirSync(startersDir)
    .filter((name) => pattern.test(name))
    .map((name) =>
      JSON.parse(fs.readFileSync(path.join(startersDir, name), "utf8"))
    );

  if (amountOfZiehsen !== 2 && starters.length === 0)
    throw "starterfile not found: " + amountOfZiehsen;

  return starters;
};
