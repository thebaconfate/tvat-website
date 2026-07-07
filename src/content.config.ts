import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

const boardYears = defineCollection({
  loader: glob({
    pattern: "*-*.json",
    base: "./public/boards",
    generateId: ({ entry }) => entry.split(".")[0],
  }),
});
export const collections = { boardYears };
