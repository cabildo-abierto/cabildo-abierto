import type { Config } from "tailwindcss";

const config= {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      maxHeight: {
        '512': '512px',
      },
      width: {
        '128': '32rem',
        '72': '18rem',
        '256': '64rem',
        '192': '48rem'
      }
    },
  },
  plugins: [],
};

export default config;