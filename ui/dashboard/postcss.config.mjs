// PostCSS config for Next.js Dashboard
// NOTE: We do NOT use @tailwindcss/postcss plugin here
// Reason: We import pre-compiled style.css (2,742 lines) for IDE autocomplete
// Architecture: input.css → Tailwind Build → style.css → globals.css

const config = {
  plugins: {
    // Empty - no Tailwind JIT processing needed
    // All Tailwind classes are pre-compiled in style.css
  },
};

export default config;


