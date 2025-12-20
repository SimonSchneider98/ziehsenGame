import { getStarters } from "./calculateStarters.js";

import fs from "fs";

const exportAllStarters = (amountOfZiehsen) => {
  const starters = getStarters(amountOfZiehsen);

  starters.forEach((starter, i) => {
    fs.writeFileSync(
      `./starters/${amountOfZiehsen}-${i + 1}.json`,
      JSON.stringify(starter, null, 2)
    );
  });
};

exportAllStarters(1);
exportAllStarters(2);
exportAllStarters(3);
exportAllStarters(4);
exportAllStarters(5);
exportAllStarters(6);
exportAllStarters(7);
exportAllStarters(8);
exportAllStarters(9);
exportAllStarters(10);
exportAllStarters(11);
exportAllStarters(12);
exportAllStarters(13);
exportAllStarters(14);
exportAllStarters(15);
exportAllStarters(16);
exportAllStarters(17);
exportAllStarters(18);
exportAllStarters(19);
exportAllStarters(20);
