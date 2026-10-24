/** Base path the app is served from: "" locally, "/<repo>" on GitHub Pages. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefixes an absolute app path with the base path. */
export const withBasePath = (path: string) => `${BASE_PATH}${path}`;
