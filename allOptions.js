import { getMatrixCopy, matricesAreEqual, printMatrices } from "./utils.js";

export { getAllOptions };

const getAllOptions = (amountOfZiehsen, shouldPrintAllOptions = false) => {
  if (amountOfZiehsen === 0) {
    console.log("du wicht!");
    return;
  }

  const start = new Date();
  const matrix = getMatrix(amountOfZiehsen);
  const allOptions = calculateAllOptions(matrix, amountOfZiehsen);
  const end = new Date();

  console.log("Processed in: " + (end - start) / 1000);
  if (shouldPrintAllOptions) printMatrices(allOptions);

  return allOptions;
};

const getMatrix = (size) => {
  let matrix = [];
  for (let i = 0; i < size; i++) {
    let column = [];
    for (let j = 0; j < size; j++) column.push(false);
    matrix.push(column);
  }
  return matrix;
};

const calculateAllOptions = (matrix, ziehsenLeft, allSteps = []) => {
  const allOptions = [];
  if (ziehsenLeft === 0) return [matrix];

  const addedOptions = [];

  for (let i = 0; i < matrix.length; i++) {
    const ziehseAddedMatrix = addZiehseToMatrix(matrix, i);

    if (
      allSteps.some((stepMatrix) =>
        matricesAreEqual(stepMatrix, ziehseAddedMatrix)
      )
    )
      continue;

    allSteps.push(ziehseAddedMatrix);

    const nextOptions = calculateAllOptions(
      ziehseAddedMatrix,
      ziehsenLeft - 1,
      allSteps
    );

    nextOptions.forEach((o) => allOptions.push(o));
  }

  return allOptions;
};

const addZiehseToMatrix = (matrix, columnNumber) => {
  const column = matrix[columnNumber];
  const index = column.indexOf(false);

  const newMatrix = getMatrixCopy(matrix);
  newMatrix[columnNumber][index] = true;
  return newMatrix;
};
