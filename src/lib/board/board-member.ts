import { stringToBoardRole, type BoardRole } from "./board-role";
import { stringToBoulon, type Boulon } from "./boulon";
import { stringToStar, type Star } from "./star";

export interface BoardMemberInterface {
  name: string;
  boardRole: string;
  stars?: string[];
  boulons?: string[];
}

export class BoardMember {
  name: string;
  boardRole: BoardRole;
  stars?: (Star | undefined)[];
  boulons?: (Boulon | undefined)[];

  constructor(boardMemberInterface: BoardMemberInterface, term?: string) {
    this.name = boardMemberInterface.name;
    try {
      this.boardRole = stringToBoardRole(boardMemberInterface.boardRole);
    } catch (e) {
      throw new Error(
        `Role: ${boardMemberInterface.boardRole} from term: ${term} not defined in BoardRole enum`,
      );
    }
    if (boardMemberInterface.stars)
      this.stars = boardMemberInterface.stars.map(stringToStar);
    else if (boardMemberInterface.boulons)
      this.boulons = boardMemberInterface.boulons.map(stringToBoulon);
  }
}
