import z from "zod/v4";
import type { credentialsSchema, tokenPayloadSchema } from "./auth.schemas";

export type Credentials = z.infer<typeof credentialsSchema>;

export type JwtPayload = z.infer<typeof tokenPayloadSchema>;
