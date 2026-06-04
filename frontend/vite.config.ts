import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Le dev et la preview de prod tournent tous deux sur le port 3000 (port mappé par docker-compose).
// host: true rend le conteneur joignable depuis l'hôte.
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 3000 },
  preview: { host: true, port: 3000 },
});
