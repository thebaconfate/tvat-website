import type { CollectionConfig } from "astro/content/config";
import type { Loader } from "astro/loaders";
import { z } from "zod/v4";

const languages = {
  ENGLISH: "Engels",
  DUTCH: "Nederlands",
  OTHER: "Anderstalig",
  FRENCH: "Frans",
  GERMAN: "Duits",
} as const;

export const languageSchema = z.enum(languages);

export const LanguageEnum = languageSchema.enum;

export type Language = z.infer<typeof languageSchema>;

export const songSchema = z.object({
  id: z.int().positive(),
  title: z.string(),
  page: z.int().positive(),
  language: languageSchema,
  description: z.string().optional(),
});

export type Song = z.infer<typeof songSchema>;

export type SongCollection = CollectionConfig<typeof songSchema, Loader>;
