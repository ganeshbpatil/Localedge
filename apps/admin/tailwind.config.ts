import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: '#07090f',
        card: '#0f1521',
        sidebar: '#0a0f1a',
        border: '#1e293b',
      },
    },
  },
};
export default config;
