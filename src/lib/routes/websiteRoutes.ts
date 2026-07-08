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
  UNAUTHENTICATED: { url: "/401" },
  FORBIDDEN: { url: "/403" },
  ABOUT_US: { url: "/about-us" },
  CONTACT: { url: "/contact" },
  HISTORY: { url: "/history" },
  LOGIN: { url: "/login" },
  LOGOUT: { url: "/logout" },
  RESET_PASSWORD: { url: "/reset-password" },
  BOARD: { url: `${BOARD_PREFIX}` },
  CODEX: {
    url: `${CODEX_PREFIX}`,
    CODEXCHALLENGE: { url: `${CODEX_PREFIX}/challenge` },
  },
  CLUBSONG: { url: "/clubsong" },
} as const;
