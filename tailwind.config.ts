import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
				mid: 'hsl(var(--mid))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        card: 'hsl(var(--card))',
        bubblelight1: 'hsl(var(--bubblelight1))',
        bubbledark1: 'hsl(var(--bubbledark1))',
        bubblelight2: 'hsl(var(--bubblelight2))',
        bubbledark2: 'hsl(var(--bubbledark2))',
        bubblelight3: 'hsl(var(--bubblelight3))',
        bubbledark3: 'hsl(var(--bubbledark3))',
        bubblelight4: 'hsl(var(--bubblelight4))',
        bubbledark4: 'hsl(var(--bubbledark4))',
        bubblelight5: 'hsl(var(--bubblelight5))',
        bubbledark5: 'hsl(var(--bubbledark5))',
        bubblelight6: 'hsl(var(--bubblelight6))',
        bubbledark6: 'hsl(var(--bubbledark6))',
        bubblelight7: 'hsl(var(--bubblelight7))',
        bubbledark7: 'hsl(var(--bubbledark7))',
        bubblelight8: 'hsl(var(--bubblelight8))',
        bubbledark8: 'hsl(var(--bubbledark8))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.6s ease-out',
        'accordion-up': 'accordion-up 0.6s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;