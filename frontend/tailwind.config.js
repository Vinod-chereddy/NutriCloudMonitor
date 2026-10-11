/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Scoped colors based on CSS variables
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        warning: 'var(--color-warning)',
        dark: 'var(--color-dark)',
        light: 'var(--color-light)',

        // Store Brand Colors
        'fk-blue': '#2874f0',
        'fk-blue-dark': '#1a5ecc',
        'fk-blue-light': '#f0f5ff',
        'fk-yellow': '#ffe500',
        'fk-orange': '#fb641b',
        'fk-orange-hover': '#eb5812',
        'fk-green': '#388e3c',
        'fk-green-light': '#e8f5e9',
        'fk-bg': '#f1f3f6',

        // Premium Indian Hybrid Theme Colors
        'india-navy': '#040b16', // Deep background
        'india-ashoka': '#000080', // Highlight Accent
        'india-saffron': '#e87b27', // Softened amber/saffron
        'india-saffron-light': '#f49c55',
        'india-emerald': '#0e7046', // Softened India Green
        'india-emerald-light': '#169d64',

        // Glassmorphism Whites (Restricted to 5-10% usage)
        'glass-white': 'rgba(255, 255, 255, 0.08)',
        'glass-white-hover': 'rgba(255, 255, 255, 0.15)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',

        // Admin Theme Colors
        'admin-bg': '#1E1B4B', // Deep Indigo
        'admin-glass': 'rgba(255,255,255,0.08)',
        'admin-accent': '#00E5FF', // Vibrant Cyan
        'admin-warning': '#F59E0B',
        'admin-danger': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        // Neomorphism Soft UI Shadows
        'neo-flat': '6px 6px 14px #d1d9e6, -6px -6px 14px #ffffff',
        'neo-sm': '3px 3px 8px #d1d9e6, -3px -3px 8px #ffffff',
        'neo-lg': '10px 10px 24px #cdd5e0, -10px -10px 24px #ffffff',
        'neo-inset': 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff',
        'neo-blue': '4px 4px 12px rgba(40,116,240,0.35), -3px -3px 8px rgba(255,255,255,0.9)',
        'neo-orange': '4px 4px 12px rgba(251,100,27,0.35), -3px -3px 8px rgba(255,255,255,0.9)',
        'neo-yellow': '4px 4px 12px rgba(255,159,0,0.35), -3px -3px 8px rgba(255,255,255,0.9)',
        'neo-outer': '4px 4px 10px rgba(0,0,0,0.5), -2px -2px 10px rgba(255,255,255,0.02)',
        'neo-inner': 'inset 4px 4px 10px rgba(0,0,0,0.5), inset -2px -2px 10px rgba(255,255,255,0.02)',
        'glass-glow': '0 8px 32px rgba(0,0,0,0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: .8, filter: 'brightness(1.2)' },
        },
        shimmer: {
          'from': { backgroundPosition: '200% 0' },
          'to': { backgroundPosition: '-200% 0' },
        }
      }
    },
  },
  plugins: [],
}
