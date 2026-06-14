/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // --- Light mode (mirrors stak-fe :root) ---
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(217 19% 18%)',

        card: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(217 19% 18%)',
        },

        primary: {
          DEFAULT: '#99f6e4',       // pastel teal — bg for primary elements
          foreground: '#0d9488',    // deep teal — text/icon on primary bg
        },

        secondary: {
          DEFAULT: '#e2e8f0',       // light slate
          foreground: '#475569',    // slate-600
        },

        muted: {
          DEFAULT: '#e2e8f0',
          foreground: '#64748b',    // slate-500
        },

        accent: {
          DEFAULT: '#e2e8f0',
          foreground: '#475569',
        },

        destructive: {
          DEFAULT: '#fecaca',       // red-200 pastel
          foreground: '#dc2626',    // red-600
        },

        success: {
          DEFAULT: '#bbf7d0',       // green-200 pastel
          foreground: '#16a34a',    // green-600
        },

        warning: {
          DEFAULT: '#fef08a',       // yellow-200 pastel
          foreground: '#ca8a04',    // yellow-600
        },

        info: {
          DEFAULT: '#bae6fd',       // sky-200 pastel
          foreground: '#0284c7',    // sky-600
        },

        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#0d9488',

        // --- Raw palette tokens (for direct use) ---
        teal: {
          pastel: '#99f6e4',
          deep: '#0d9488',
          darker: '#065f46',
        },
      },

      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },

      fontFamily: {
        sans: ['Inter_400Regular', 'System'],
        'sans-medium': ['Inter_500Medium', 'System'],
        'sans-semibold': ['Inter_600SemiBold', 'System'],
        'sans-bold': ['Inter_700Bold', 'System'],
      },
    },
  },
  plugins: [],
};
