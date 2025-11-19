import rawCalendar from "./rawCalendar.js";
import { transformCalendar } from "../../scripts/transformCalendar.js";
import fs from "fs";

export default async function () {
  // Fetch + transform event data
  const transformed = await transformCalendar(await rawCalendar());

  // Write to output.json (Eleventy passthrough will copy it to _site/)
  fs.writeFileSync(
    "output.json",
    JSON.stringify(transformed, null, 2),
    "utf-8"
  );

  return transformed;
}
