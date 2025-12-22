import fs from "fs";

import {
  getColumnCopy,
  getMatrixCopy,
  matricesAreEqual,
  printMatrices,
  loadPreviousStarters,
} from "./utils.js";

export { getStarters };

const getStarters = (amountOfZiehsen, printStarters = false) => {
  if (amountOfZiehsen == 0) {
    console.log("du wicht!");
    return;
  }

  if (amountOfZiehsen === 1) {
    const json = fs.readFileSync("./allOptions/1.json", "utf8");
    const allOptions = JSON.parse(json);
    return allOptions;
  }

  const start = new Date();
  const previousStarters = loadPreviousStarters(amountOfZiehsen);
  const allOptions = loadAllOptions(amountOfZiehsen);
  const starters = calculateStarters(allOptions, previousStarters);
  const end = new Date();
  console.log("Processed in: " + (end - start) / 1000);

  if (printStarters) printMatrices(starters);

  return starters;
};

const loadAllOptions = (amountOfZiehsen) => {
  const json = fs.readFileSync(`./allOptions/${amountOfZiehsen}.json`, "utf8");
  return JSON.parse(json);
};

const calculateStarters = (allOptions, previousStarters) => {
  const starters = [];
  allOptions.forEach((option) => {
    const plays = getAllPlays(option);
    if (
      !previousStarters.some((starter) => {
        // order starter, play is important because of the way matricesAreEqual is implemented
        // the smaller matrix has to come first
        const res = plays.some((play) => matricesAreEqual(play, starter));
        return res;
      })
    )
      starters.push(option);
  });

  return starters;
};

const getAllPlays = (option) => {
  const allPlays = [];
  for (let i = 0; i < option.length; i++) {
    const allColumnPlays = getAllColumnPlays(option, i);
    allPlays.push(...allColumnPlays);
  }

  return allPlays;
};

const getAllColumnPlays = (option, columnIndex) => {
  const allColumnPlays = [];

  const column = option[columnIndex];
  let columnCopy = getColumnCopy(column);

  const index = column.indexOf(false);
  const columnZiehsenCount = index === -1 ? column.length : index;

  for (let i = columnZiehsenCount; i > 0; i--) {
    const optionCopy = getMatrixCopy(option);

    const iterationColumnCopy = getColumnCopy(columnCopy);
    iterationColumnCopy[i - 1] = false;
    columnCopy = iterationColumnCopy;

    optionCopy[columnIndex] = columnCopy;

    allColumnPlays.push(optionCopy);
  }

  return allColumnPlays;
};

getStarters(5, true);
