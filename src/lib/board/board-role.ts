export enum BoardRole {
  President = "Praeses",
  VicePresident = "Vice-Praeses",
  Treasurer = "Quaestor",
  Secretary = "Ab-Actis",
  Cantor = "Cantor",
  Tamer = "Temmer",
  SchachtenTemmer = "Schachtentemmer",
  BeastTamer = "Beestenmeester",
  MagisterKrambambouli = "Magister Krambambouli",
  Gala = "Gala",
  Gala1 = "Gala-verantwoordelijke",
  SongFestival = "Zangfeest",
  Party = "Feest",
  Webmaster = "Webmaster",
  Scriptor = "Scriptor",
  Designer = "Designer",
  Design = "Design",
  EHBO = "EHBO",
  SportAndCulture = "Spocul",
  CultureMaster = "Cultuurmeester",
  CultureMaster2 = "Cultuur meester",
  CultureMaster3 = "Cultuur",
  Sport = "Sport",
  SportMaster = "Sport meester",
  Kodak = "Kodak",
  BeerMaster = "Biermeester",
  Member = "Medewerker",
}

const stringToRoleMap: Record<string, BoardRole> = Object.values(
  BoardRole,
).reduce(
  (acc, role) => {
    acc[role] = role;
    return acc;
  },
  {} as Record<string, BoardRole>,
);

export function stringToBoardRole(str: string): BoardRole {
  const role = stringToRoleMap[str];
  if (!role) throw new Error(`${str} is not a known board role.`);
  return role;
}

export const boardRoleIndex: Record<BoardRole, number> = {
  [BoardRole.President]: 1,
  [BoardRole.VicePresident]: 2,
  [BoardRole.Treasurer]: 3,
  [BoardRole.Secretary]: 4,
  [BoardRole.Cantor]: 5,
  [BoardRole.BeastTamer]: 10,
  [BoardRole.Tamer]: 10 + 1,
  [BoardRole.SchachtenTemmer]: 10 + 1,
  [BoardRole.MagisterKrambambouli]: 15,
  [BoardRole.Gala]: 20,
  [BoardRole.Gala1]: 20 + 1,
  [BoardRole.SongFestival]: 30,
  [BoardRole.Party]: 40,
  [BoardRole.Webmaster]: 50,
  [BoardRole.Designer]: 90,
  [BoardRole.Design]: 100,
  [BoardRole.EHBO]: 110,
  [BoardRole.Scriptor]: 120,
  [BoardRole.Kodak]: 150,
  [BoardRole.SportAndCulture]: 50_000,
  [BoardRole.Sport]: 100_000,
  [BoardRole.SportMaster]: 100_000,
  [BoardRole.CultureMaster]: 1_000_000 - 1,
  [BoardRole.CultureMaster2]: 1_000_000,
  [BoardRole.CultureMaster3]: 1_000_000 + 1,
  [BoardRole.BeerMaster]: 1_000_000_000,
  [BoardRole.Member]: Infinity,
};

export function compareBoardRoles(
  a: BoardRole,
  b: BoardRole,
  descending: boolean = true,
) {
  return descending
    ? (boardRoleIndex[a] ?? Infinity) - (boardRoleIndex[b] ?? Infinity)
    : (boardRoleIndex[b] ?? Infinity) - (boardRoleIndex[a] ?? Infinity);
}
