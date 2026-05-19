import { terms } from "../../generated/terms.ts";
import { sortByTerm } from "../board/board-year";

terms.sort(sortByTerm);
const latestTerm = terms[0];

export const websiteRoutes = {
  home: { url: "/" },
  krambambouli: { url: "/krambambouli" },
  activities: { url: "/activities", lustrumgala: { url: "/lustrumgalabal" } },
  aboutUs: { url: "/about-us" },
  contact: { url: "/contact" },
  history: { url: "/history" },
  login: { url: "/login" },
  board: { url: `/board/${latestTerm}` },
  codex: { url: "/codex", codexChallenge: { url: "/challenge" } },
  clubsong: { url: "/clubsong" },
} as const;
