import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "buy-signal": "#dcfce7",
        "buy-signal-text": "#166534",
        "hold-signal": "#fef9c3",
        "sell-signal": "#fee2e2",
      },
    },
  },
  plugins: [],
};
export default config;
