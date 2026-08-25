import { file, glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { songSchema } from "./lib/codex-challenge";
import { z } from "zod/v4";

const boardYears = defineCollection({
  loader: glob({
    pattern: "*-*.json",
    base: "./public/boards",
    generateId: ({ entry }) => entry.split(".")[0],
  }),
});

const rawSongSchema = songSchema.omit({ id: true });

type RawSong = z.infer<typeof rawSongSchema>;

const songs = defineCollection({
  loader: file("./public/songs.json", {
    parser: (text) => {
      const songs: RawSong[] = JSON.parse(text);
      return songs.map((song, index) => {
        return { ...song, id: index + 1 };
      });
    },
  }),
  schema: songSchema,
});

export const collections = { boardYears, songs };
