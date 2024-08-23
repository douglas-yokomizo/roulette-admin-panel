import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        roulette: 'url("../public/images/bgRoulette.png")',
        prize: 'url("../public/images/bgPrize.png")',
      },
      fontFamily: {
        "tt-travels": ["TTTravels-DemiBold", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
