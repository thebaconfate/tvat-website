import { BoardMember, type BoardMemberInterface } from "./board-member";

export interface BoardYearInterface {
  term: string;
  boardMembers: BoardMemberInterface[];
}

export class BoardYear {
  term: string;
  boardMembers: BoardMember[];
  constructor(boardYearInterface: BoardYearInterface) {
    this.term = boardYearInterface.term;
    this.boardMembers = boardYearInterface.boardMembers.map(
      (i) => new BoardMember(i),
    );
  }
}

export function sortBoardYearByTerm(a: BoardYear, b: BoardYear) {
  const startA = parseInt(a.term.split("-")[0]);
  const startB = parseInt(b.term.split("-")[0]);
  return startA - startB;
}

export function sortByTerm(a: string, b: string, descending = true) {
  return descending
    ? parseInt(b.split("-")[0]) - parseInt(a.split("-")[0])
    : parseInt(a.split("-")[0]) - parseInt(b.split("-")[0]);
}
