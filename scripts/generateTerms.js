import fs from "fs/promises";
import path from "path";
import prettier from "prettier";

// Path to your public boards directory
const boardsDir = path.resolve("./public/boards");

// Path to the output directory
const outputDir = path.resolve("./src/generated");

// Make sure the output directory exists
await fs.mkdir(outputDir, { recursive: true });

// Read all JSON files in that directory
const directory = (await fs.readdir(boardsDir)).filter((f) =>
  /(\d{4}-\d{4})\.json$/.test(f),
);

// Extract term names from filenames (e.g., 2025-2026.json → 2025-2026)
const terms = await Promise.all(
  directory.map(async (filename) => {
    const filePath = path.join(boardsDir, filename);
    try {
      const data = await fs.readFile(filePath, "utf-8");
      const content = JSON.parse(data);
      if (!content.term) throw Error(`Term not defined in ${filename}`);
      const term = content.term.split("-");
      if (path.parse(filename).name !== content.term)
        throw Error(
          `Filename ${filename} does not match term :${content.term}`,
        );
      const beginningTerm = parseInt(term[0]);
      const endTerm = parseInt(term[1]);
      if (endTerm - beginningTerm !== 1)
        throw Error(`Term ${content.term} is longer than a year`);
      return content.term;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }),
);

// Generate a small JS/TS module exporting the terms array
const output = `export const terms: string[] = ${JSON.stringify(terms, null, 2)};\n`;

const formatted = await prettier.format(output, { parser: "typescript" });

await fs.writeFile(path.join(outputDir, "terms.ts"), formatted);

console.log("Generated terms.ts with terms:\n", terms);
