import z from "zod/v4";

const roleValues = ["root", "admin", "boardMember"] as const;

export const roleSchema = z.enum(roleValues);

export const RoleEnum = roleSchema.enum;
