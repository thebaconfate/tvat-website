/**
 * The first error of a TanStack Form field (`field.state.meta.errors`) as text, for `Field`'s
 * `error`. Errors can be strings or objects with a `message` (e.g. from Zod).
 */
export function firstError(errors: unknown[]): string | undefined {
  for (const error of errors) {
    if (typeof error === "string" && error) return error;
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message
    )
      return error.message;
  }
  return undefined;
}
