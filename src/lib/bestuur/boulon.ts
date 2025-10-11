export enum Boulon {
  Silver = "Z",
  Gold = "G",
}

export function stringToBoulon(str: string) {
  return Object.values(Boulon).includes(str as Boulon)
    ? (str as Boulon)
    : undefined;
}
