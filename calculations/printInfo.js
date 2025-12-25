import { getAllOptions } from './calculateAllOptions.js';
import { loadPreviousStarters, printMatrices } from './utils.js';

const printAllOptions = (amountOfZiehsen) => {
  const previousOptions = getAllOptions(amountOfZiehsen, true);
  // printMatrices(previousOptions);
};

const printAllStarters = (amountOfZiehsen) => {
  const previousStarters = loadPreviousStarters(amountOfZiehsen + 1);
  printMatrices(previousStarters);
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
      .join('\n')
  );
};

printAllOptions(3);
// printAllStarters(12);
// printAllStarterDistributions(20);
