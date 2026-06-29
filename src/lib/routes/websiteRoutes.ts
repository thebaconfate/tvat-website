import { terms } from "../../generated/terms.ts";
import { sortByTerm } from "../board/board-year";

terms.sort(sortByTerm);
const latestTerm = terms[0];

const ACTIVITIES_BASE = "/activities" as const;
const CODEX_PREFIX = "/codex" as const;
const BOARD_PREFIX = "/board" as const;

export const ROUTES = {
  HOME: { url: "/" },
  KRAMBAMBOULI: { url: "/krambambouli" },
  ACTIVITIES: {
    url: `${ACTIVITIES_BASE}`,
    LUSTRUMGALA: { url: `${ACTIVITIES_BASE}/lustrumgalabal` },
  },
  ABOUT_US: { url: "/about-us" },
  CONTACT: { url: "/contact" },
  HISTORY: { url: "/history" },
  LOGIN: { url: "/login" },
  BOARD: { url: `${BOARD_PREFIX}/${latestTerm}` },
  CODEX: {
    url: `${CODEX_PREFIX}`,
    CODEXCHALLENGE: { url: `${CODEX_PREFIX}/challenge` },
  },
  CLUBSONG: { url: "/clubsong" },
} as const;
