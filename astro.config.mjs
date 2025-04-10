// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  redirects: {
    "/home": "/",
  },

  output: "server",
  integrations: [react()],

  adapter: node({
    mode: "standalone",
  }),
});
