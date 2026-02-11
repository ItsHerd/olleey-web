/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
	darkMode: ['class', "class"],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					'var(--font-dm-sans)',
					'DM Sans',
					'sans-serif'
				]
			},
			animation: {
				'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
				'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
				'element': 'fadeSlideIn 0.6s ease-out forwards',
				'slide-right': 'slideRightIn 0.8s ease-out forwards',
				'testimonial': 'testimonialIn 0.6s ease-out forwards',
				'accordion-down': 'accordion-down 0.3s cubic-bezier(0.87, 0, 0.13, 1)',
				'accordion-up': 'accordion-up 0.3s cubic-bezier(0.87, 0, 0.13, 1)'
			},
			keyframes: {
				'spin-around': {
					'0%': {
						transform: 'translateZ(0) rotate(0)'
					},
					'15%, 35%': {
						transform: 'translateZ(0) rotate(90deg)'
					},
					'65%, 85%': {
						transform: 'translateZ(0) rotate(270deg)'
					},
					'100%': {
						transform: 'translateZ(0) rotate(360deg)'
					}
				},
				'shimmer-slide': {
					to: {
						transform: 'translate(calc(100cqw - 100%), 0)'
					}
				},
				'fadeSlideIn': {
					'0%': {
						opacity: '0',
						filter: 'blur(10px)',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						filter: 'blur(0px)',
						transform: 'translateY(0px)'
					}
				},
				'slideRightIn': {
					'0%': {
						opacity: '0',
						filter: 'blur(10px)',
						transform: 'translateX(40px)'
					},
					'100%': {
						opacity: '1',
						filter: 'blur(0px)',
						transform: 'translateX(0px)'
					}
				},
				'testimonialIn': {
					'0%': {
						opacity: '0',
						filter: 'blur(10px)',
						transform: 'translateY(20px) scale(0.9)'
					},
					'100%': {
						opacity: '1',
						filter: 'blur(0px)',
						transform: 'translateY(0px) scale(1)'
					}
				},
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				}
			},
			colors: {
				light: {
					bg: '#e8e8e8',
					bgAlt: '#f1f3f5',
					card: '#ffffff',
					cardAlt: '#f1f3f5',
					text: '#111827',
					textSecondary: '#374151',
					accent: '#dc2626',
					accentAlt: '#b91c1c',
					accentSecondary: '#d97706',
					accentSecondaryAlt: '#b45309',
					border: '#d1d5db',
					borderAlt: '#9ca3af'
				},
				dark: {
					bg: '#0A0A0A',
					bgAlt: '#0F0F0F',
					card: '#141414',
					cardAlt: '#1A1A1A',
					text: '#f0f2f5',
					textSecondary: '#a0a8b0',
					accent: '#f28a80',
					accentAlt: '#f0807b',
					accentSecondary: '#f0c674',
					accentSecondaryAlt: '#edc667',
					border: '#1c1c1c'
				},
				olleey: {
					black: '#272932',
					white: '#FFFFFF',
					yellow: '#EEB868'
				},
				sheaperd: {
					black: '#000000',
					graphite: '#2E2E2E',
					snow: '#FAFAFA',
					lavender: '#8D99AE'
				},
				studio: {
					bg: '#0f0f10',
					panel: '#202124',
					panelAlt: '#1a1b1d',
					border: '#2a2b2f',
					text: '#e8eaed',
					muted: '#9aa0a6',
					accent: '#3ea6ff'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
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
	plugins: [require("tailwindcss-animate")]
};
