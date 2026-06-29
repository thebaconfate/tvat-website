const apiPrefix = "/api";
export const apiRoutes = {
  auth: {
    url: `${apiPrefix}/auth`,
    login: { url: "/login" },
    forgotPassword: { url: "/forgot-password" },
  },
} as const;
