const config= {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      maxHeight: {
        '512': '512px',
      },
      width: {
        '128': '32rem',
        '72': '18rem',
        '90': '22.5rem',
        '256': '64rem',
        '192': '48rem'
      },
      fontFamily: {
        flex: ['var(--font-flex)'],
        serif: ['var(--font-serif)'],
      },
    },
  },
  plugins: [],
};

export default config;