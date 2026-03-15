import { RoleEnum } from "./role.schema";
import type { Role } from "./role.types";

export const roleRank: Record<Role, number> = {
  [RoleEnum.root]: 0,
  [RoleEnum.admin]: 1,
  [RoleEnum.boardMember]: 10,
};

export function compareRole(a: Role, b: Role) {
  return roleRank[a] - roleRank[b];
}

export function sortRole(roles: Role[], desc: boolean = true) {
  return desc
    ? roles.toSorted((a, b) => compareRole(a, b))
    : roles.toSorted((a, b) => compareRole(b, a));
}
