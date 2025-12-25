import { getAllOptions } from './calculateAllOptions.js';

import fs from 'fs';
import path from 'path';

const exportAllOptions = (amountOfZiehsen) => {
  const dir = './allOptions';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const allOptions = getAllOptions(amountOfZiehsen);

  fs.writeFileSync(
    path.join(dir, `${amountOfZiehsen}.json`),
    JSON.stringify(allOptions, null, 2)
  );
};

exportAllOptions(1);
exportAllOptions(2);
exportAllOptions(3);
exportAllOptions(4);
exportAllOptions(5);
exportAllOptions(6);
exportAllOptions(7);
exportAllOptions(8);
exportAllOptions(9);
exportAllOptions(10);
exportAllOptions(11);
exportAllOptions(12);
exportAllOptions(13);
exportAllOptions(14);
exportAllOptions(15);
exportAllOptions(16);
exportAllOptions(17);
exportAllOptions(18);
exportAllOptions(19);
exportAllOptions(20);
