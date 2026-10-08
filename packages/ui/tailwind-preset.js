/** Tailwind preset — AcessaNet Connect design tokens (ver packages/ui/src/tokens.css) */
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)",
          900: "var(--brand-900)",
          950: "var(--brand-950)",
        },
        muted: {
          300: "var(--muted-300)",
          400: "var(--muted-400)",
          600: "var(--muted-600)",
          800: "var(--muted-800)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          subtle: "var(--surface-subtle)",
          muted: "var(--surface-muted)",
          border: "var(--surface-border)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          inverted: "var(--text-inverted)",
        },
        success: "var(--color-success)",
        danger: "var(--color-danger)",
        warning: "var(--color-warning)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lifted: "var(--shadow-lifted)",
      },
    },
  },
};
