import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1f5a76",
          dark: "#163f59",
          light: "#e8f3f9",
          accent: "#f4b942",
          soft: "#f8f4ee",
        },
      },
      boxShadow: {
        premium: "0 20px 50px rgba(31, 90, 118, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
