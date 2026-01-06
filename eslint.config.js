import betterTailwindcss from "eslint-plugin-better-tailwindcss";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "better-tailwindcss": betterTailwindcss,
    },
    rules: {
      "better-tailwindcss/no-custom-classname": "warn",
      "better-tailwindcss/no-contradicting-classname": "error",
    },
  },
  {
    files: ["ui/**/*.css", "scripts/**/*.ts"],
    rules: {
      "better-tailwindcss/no-custom-classname": "off",
    },
  },
  {
    ignores: ["**/*.md"],
  },
];

