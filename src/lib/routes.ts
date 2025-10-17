import { sortByTerm } from "./board/board-year";

const boardFiles = import.meta.glob("../../public/boards/*.json", {
  eager: true,
});
const terms = Object.keys(boardFiles)
  .map((path) => path.match(/boards\/(\d{4}-\d{4})\.json$/)?.[1])
  .filter(Boolean) as string[];
terms.sort(sortByTerm);
const latestTerm = terms[0];

const websiteRoutes = {
  home: { url: "/" },
  lustrumGala: { url: "/lustrumgalabal" },
  board: { url: `/bestuur/${latestTerm}` },
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
    cantus: { url: "/cantus" },
    order: { url: "/order" },
  },
  store: {
    url: `${baseApiUrl}/store`,
    products: { url: "/products", krambambouli: { url: "/krambambouli" } },
  },
};
export { websiteRoutes, apiRoutes };
