import uiPreset from "@acessanet/ui/tailwind-preset.js";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [uiPreset],
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
