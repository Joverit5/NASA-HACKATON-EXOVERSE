import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			serif: ['var(--font-serif)', 'Georgia', 'serif'],
  			sans: ['var(--font-serif)', 'Georgia', 'serif'],
  			mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace']
  		},
  		transitionDuration: {
  			tick: '240ms',
  			'tick-2': '480ms',
  			'tick-3': '720ms'
  		},
  		transitionTimingFunction: {
  			tick: 'cubic-bezier(0.2, 0, 0, 1)'
  		},
  		colors: {
  			void: 'hsl(var(--void))',
  			surface: 'hsl(var(--surface))',
  			raised: 'hsl(var(--raised))',
  			rule: {
  				DEFAULT: 'hsl(var(--rule))',
  				strong: 'hsl(var(--rule-strong))'
  			},
  			ink: {
  				DEFAULT: 'hsl(var(--ink))',
  				dim: 'hsl(var(--ink-dim))',
  				faint: 'hsl(var(--ink-faint))'
  			},
  			mint: {
  				DEFAULT: 'hsl(var(--mint))',
  				deep: 'hsl(var(--mint-deep))'
  			},
  			hostile: 'hsl(var(--hostile))',
  			source: 'hsl(var(--source))',
  			gold: 'hsl(var(--gold))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
