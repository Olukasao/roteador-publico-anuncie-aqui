/**
 * Tailwind preset — AcessaNet Connect design tokens (ver packages/ui/src/tokens.css).
 * Cada cor usa `rgb(var(--x) / <alpha-value>)`, não `var(--x)` puro — é o padrão
 * documentado do Tailwind pra cores vindas de CSS vars continuarem aceitando
 * modificadores de opacidade (`text-brand-200/90`); sem isso o modificador gera CSS
 * inválido e o navegador descarta a cor inteira.
 */
function withOpacity(variable) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        brand: {
          50: withOpacity("--brand-50"),
          100: withOpacity("--brand-100"),
          200: withOpacity("--brand-200"),
          300: withOpacity("--brand-300"),
          400: withOpacity("--brand-400"),
          500: withOpacity("--brand-500"),
          600: withOpacity("--brand-600"),
          700: withOpacity("--brand-700"),
          800: withOpacity("--brand-800"),
          900: withOpacity("--brand-900"),
          950: withOpacity("--brand-950"),
        },
        muted: {
          300: withOpacity("--muted-300"),
          400: withOpacity("--muted-400"),
          600: withOpacity("--muted-600"),
          800: withOpacity("--muted-800"),
        },
        surface: {
          DEFAULT: withOpacity("--surface"),
          subtle: withOpacity("--surface-subtle"),
          muted: withOpacity("--surface-muted"),
          border: withOpacity("--surface-border"),
        },
        text: {
          primary: withOpacity("--text-primary"),
          secondary: withOpacity("--text-secondary"),
          inverted: withOpacity("--text-inverted"),
        },
        success: withOpacity("--color-success"),
        danger: withOpacity("--color-danger"),
        warning: withOpacity("--color-warning"),
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
