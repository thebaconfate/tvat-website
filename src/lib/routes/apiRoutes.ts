const API_PREFIX = "/api" as const;
const AUTH_PREFIX = `${API_PREFIX}/auth` as const;
const KRAMBALBOULI_PREFIX = `${API_PREFIX}/krambambouli`;

export const API_ROUTES = {
  url: API_PREFIX,
  AUTH: {
    url: `${AUTH_PREFIX}`,
    LOGIN: { url: `${AUTH_PREFIX}/login` },
    AUTHENTICATE: { url: `${AUTH_PREFIX}/authenticate` },
    FORGOT_PASSWORD: { url: `${AUTH_PREFIX}/forgot-password` },
    RESET_PASSWORD: { url: `${AUTH_PREFIX}/reset-password` },
    PASSAGE: { url: `${AUTH_PREFIX}/passage` },
    STATION: { url: `${AUTH_PREFIX}/station` },
  },
  ACTIVITIES: { url: `${API_PREFIX}/activites` },
  CONTACT: { url: `${API_PREFIX}/contact` },
  KRAMBALBOULI: {
    url: `${API_PREFIX}`,
    ORDER: { url: `${KRAMBALBOULI_PREFIX}/order` },
    ORDERS: { url: `${KRAMBALBOULI_PREFIX}/orders` },
  },
} as const;
