import { defineConfig } from "vitest/config";

/**
 * Present (and intentionally empty) so Vitest does not inherit the Vite
 * build config, whose `root: "src"` would hide the test/ directory from
 * test discovery. Test-specific settings would go here.
 */
export default defineConfig({});
