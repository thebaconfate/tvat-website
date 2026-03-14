import type z4 from "zod/v4";
import type { credentialsSchema } from "./auth.schemas";
import type { Role } from "../users";

export type Credentials = z4.infer<typeof credentialsSchema>;

export type Claims = {
  sub: number;
  role: Role;
};
