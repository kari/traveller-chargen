import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
    root: "src",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: resolve(import.meta.dirname, "src", "index.html"),
                about: resolve(import.meta.dirname, "src", "about.html"),
                worldgen: resolve(import.meta.dirname, "src", "worldgen.html"),
            },
        },
    },
});
