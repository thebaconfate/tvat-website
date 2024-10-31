const websiteRoutes = {
  home: { url: "/" },
  lustrumGala: { url: "/lustrumgalabal" },
  board: { url: "/bestuur" },
  clubsong: { url: "/clublied" },
  history: { url: "/history" },
  krambambouli: { url: "/krambambouli" },
  codex: { url: "/codex", challenge: { url: "/challenge" } },
  youtube: { url: "https://www.youtube.com/channel/UCm0gsmr5OWyS_0LNXkIqmBw" },
  mailingslist: { url: "/mailingslijst", enroll: { url: "/inschrijven" } },
  membership: { url: "/lidkaarten" },
  contact: { url: "/contact" },
  login: { url: "/login" },
};

const baseApiUrl = "/api";

const apiRoutes = {
  krambambouli: {
    url: `${baseApiUrl}/krambambouli`,
    pickup: { url: "/pickup" },
    delivery: { url: "/delivery" },
  },
  store: {
    url: `${baseApiUrl}/store`,
    products: { url: "/products", krambambouli: { url: "krambambouli" } },
  },
};
export { websiteRoutes, apiRoutes };
