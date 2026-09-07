/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// PRD §25.1 — connect-src 'none' makes it structurally impossible for the
// production build to phone home. Applied to `build` only (not `serve`),
// since it would otherwise block Vite's own dev-server HMR websocket.
const CSP =
  "default-src 'self'; connect-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'";

function cspPlugin(): Plugin {
  return {
    name: "inject-csp-meta",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(
        "<head>",
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cspPlugin()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
