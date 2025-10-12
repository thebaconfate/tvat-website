export enum BoardRole {
  President = "Praeses",
  VicePresident = "Vice-Praeses",
  Treasurer = "Quaestor",
  Secretary = "Ab-Actis",
  Cantor = "Cantor",
  Tamer = "Temmer",
  MagisterKrambambouli = "Magister Krambambouli",
  Webmaster = "Webmaster",
  SongFestival = "Zangfeest",
  SportAndCulture = "Spocul",
  Member = "Medewerker",
}

export function stringToBoardRole(str: string) {
  return Object.values(BoardRole).includes(str as BoardRole)
    ? (str as BoardRole)
    : BoardRole.Member;
}

export const boardRoleOrder: BoardRole[] = [
  BoardRole.President,
  BoardRole.VicePresident,
  BoardRole.Treasurer,
  BoardRole.Secretary,
  BoardRole.Cantor,
  BoardRole.Tamer,
  BoardRole.MagisterKrambambouli,
  BoardRole.Webmaster,
  BoardRole.SongFestival,
  BoardRole.SportAndCulture,
  BoardRole.Member,
];
