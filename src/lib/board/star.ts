export enum Star {
  Silver = "Z",
  Gold = "G",
}

export function stringToStar(str: string) {
  return Object.values(Star).includes(str as Star) ? (str as Star) : undefined;
}
