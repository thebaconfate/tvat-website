import { getCollection } from "astro:content";
import { sortByTerm } from "../board/board-year";

const boardYears = await getCollection("boardYears");
boardYears.sort((a, b) => sortByTerm(a.data.term, b.data.term));
export const latestTerm = boardYears[0]?.data.term;
