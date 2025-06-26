import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    middlewareMode: false,
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [
    tailwindcss(),
    react(),
    {
      name: "express-integration",
      configureServer(server) {
        const app = createServer();

        // Ajouter le middleware Express avant les autres middlewares Vite
        server.middlewares.use("/api", app);
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));
