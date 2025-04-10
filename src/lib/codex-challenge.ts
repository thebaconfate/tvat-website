export enum Language {
  DUTCH = "Nederlands",
  FRENCH = "Frans",
  GERMAN = "Duits",
  ENGLISH = "Engels",
  OTHER = "Anderstalig",
}

export interface Song {
  title: string;
  page: number;
  language: Language;
  description?: string;
}
