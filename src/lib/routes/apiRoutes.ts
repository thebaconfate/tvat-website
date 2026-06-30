const API_PREFIX = "/api" as const;
const AUTH_PREFIX = `${API_PREFIX}/auth` as const;

export const API_ROUTES = {
  AUTH: {
    url: `${AUTH_PREFIX}`,
    LOGIN: { url: `${AUTH_PREFIX}/login` },
    FORGOT_PASSWORD: { url: `${AUTH_PREFIX}/forgot-password` },
    RESET_PASSWORD: { url: `${AUTH_PREFIX}/reset-password` },
  },
} as const;
