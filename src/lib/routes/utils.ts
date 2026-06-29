type CleanSlash<S extends string> = S extends `${infer Head}//${infer Tail}`
  ? CleanSlash<`${Head}/${Tail}`>
  : S extends ""
    ? "/"
    : S;

// The exact Type Engine
type TransformRoutes<T, Prefix extends string = ""> = {
  readonly [K in keyof T]: T[K] extends string
    ? K extends "base"
      ? CleanSlash<`${Prefix}/${T[K]}`>
      : T extends { base: infer B extends string }
        ? CleanSlash<`${Prefix}/${B}/${T[K]}`>
        : CleanSlash<`${Prefix}/${T[K]}`>
    : T[K] extends object
      ? TransformRoutes<
          T[K],
          T extends { base: infer B extends string }
            ? CleanSlash<`${Prefix}/${B}`>
            : Prefix
        >
      : never;
};

export function buildRoutes<T extends object>(
  obj: T,
  prefix = "",
): TransformRoutes<T> {
  const routes: any = {};
  const currentBase = (obj as any).base !== undefined ? (obj as any).base : "";

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      let finalPath = "";
      if (key === "base") {
        finalPath = `${prefix}/${value}`;
      } else {
        const pathPrefix = currentBase ? `${prefix}/${currentBase}` : prefix;
        finalPath = `${pathPrefix}/${value}`;
      }

      // Clean up slashes identically to the CleanSlash type
      finalPath = finalPath.replace(/\/+/g, "/");
      routes[key] = finalPath === "" ? "/" : finalPath;
    } else if (typeof value === "object" && value !== null) {
      routes[key] = buildRoutes(
        value,
        currentBase ? `${prefix}/${currentBase}` : prefix,
      );
    }
  }
  return routes as TransformRoutes<T>;
}
