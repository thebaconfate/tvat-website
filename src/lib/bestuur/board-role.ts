export enum BoardRole {
  President = "Praeses",
  VicePresident = "Vice-President",
  Treasurer = "Quaestor",
  Secretary = "Ab-Actis",
  Tamer = "Temmer",
  MagisterKrambambouli = "Magister Krambambouli",
  Webmaster = "Webmaster",
  SportAndCulture = "Spocul",
  Volunteer = "Medewerker",
}

export function stringToBoardRole(str: string) {
  return Object.values(BoardRole).includes(str as BoardRole)
    ? (str as BoardRole)
    : BoardRole.Volunteer;
}
