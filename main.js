const AMOUNT_OF_ZIEHSEN = 15;

const main = () => {
  if (AMOUNT_OF_ZIEHSEN == 0) {
    console.log("du wicht!");
    return;
  }

  const start = new Date();
  const matrix = getMatrix(AMOUNT_OF_ZIEHSEN);
  const options = getAllOptions(matrix, AMOUNT_OF_ZIEHSEN);
  const end = new Date();
  console.log("Processed in: " + (end - start) / 1000);
  printGoikers(options);
};

const getMatrix = (size) => {
  let matrix = [];
  for (let i = 0; i < size; i++) {
    let column = [];
    for (let j = 0; j < size; j++) column.push("-");
    matrix.push(column);
  }
  return matrix;
};

const getAllOptions = (matrix, ziehsenLeft, allSteps = []) => {
  const allOptions = [];
  if (ziehsenLeft == 0) return [matrix];

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

    const nextOptions = getAllOptions(
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
  const index = column.indexOf("-");

  const newMatrix = getCopy(matrix);
  newMatrix[columnNumber][index] = "x";
  return newMatrix;
};

const getCopy = (matrix) => {
  const size = matrix.length;
  const copy = [];

  for (let i = 0; i < size; i++) {
    let column = [];
    for (let j = 0; j < size; j++) column.push(matrix[i][j]);
    copy.push(column);
  }

  return copy;
};

const removeDuplicates = (matrices) => {
  return matrices.filter((matrix1, index1) => {
    return !matrices.some((matrix2, index2) => {
      return index2 > index1 && matricesAreEqual(matrix1, matrix2);
    });
  });
};

const matricesAreEqual = (m1, m2) => {
  const m2Copy = getCopy(m2);

  for (let i = 0; i < m1.length; i++) {
    const equalColumnIndex = m2Copy.findIndex((m2Column) =>
      columnsAreEqual(m1[i], m2Column)
    );
    if (equalColumnIndex == -1) return false;
    m2Copy.splice(equalColumnIndex, 1);
  }

  return true;
};

const columnsAreEqual = (c1, c2) => {
  const result =
    c1.filter((cell) => cell == "x").length ==
    c2.filter((cell) => cell == "x").length;

  return result;
};

const printGoikers = (options) => {
  console.log("Count:", options.length);

  options.forEach((matrix, i) => {
    const rows = matrix.length;
    const cols = matrix[0].length;

    console.log("--" + "----".repeat(cols));
    console.log(i + 1 + "\n");

    for (let col = 0; col < cols; col++) {
      let line = [];
      for (let row = 0; row < rows; row++) {
        line.push(matrix[row][col]);
      }
      console.log("| " + line.join(" | ") + " |");
    }

    console.log("\n--" + "----".repeat(cols));
  });
};

main();
