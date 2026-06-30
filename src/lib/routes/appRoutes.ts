const prefix = "/app" as const;

const KRAMBAMBOULI_BASE = `${prefix}/krambambouli`;

export const APP_ROUTES = {
  KRAMBAMBOULI: {
    url: KRAMBAMBOULI_BASE,
    DASHBOARD: { url: `${KRAMBAMBOULI_BASE}/dashboard` },
  },
} as const;
