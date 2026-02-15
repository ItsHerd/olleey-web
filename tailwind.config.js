/** @type {import('tailwindcss').Config} */
const oklchColor = (name, alphaName = `${name}-alpha`) => ({ opacityValue, opacityVariable } = {}) => {
	const resolvedOpacity = opacityValue ?? opacityVariable;
	if (resolvedOpacity !== undefined) {
		if (typeof resolvedOpacity === 'string' && resolvedOpacity.includes('var(')) {
			return `oklch(var(--${name}-channels) / calc(var(--${alphaName}, 1) * ${resolvedOpacity}))`;
		}
		return `oklch(var(--${name}-channels) / ${resolvedOpacity})`;
	}
	return `oklch(var(--${name}-channels) / var(--${alphaName}, 1))`;
};

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
				border: oklchColor('border'),
				input: oklchColor('input'),
				ring: oklchColor('ring'),
				background: oklchColor('background'),
				foreground: oklchColor('foreground'),
				primary: {
					DEFAULT: oklchColor('primary'),
					foreground: oklchColor('primary-foreground')
				},
				secondary: {
					DEFAULT: oklchColor('secondary'),
					foreground: oklchColor('secondary-foreground')
				},
				destructive: {
					DEFAULT: oklchColor('destructive'),
					foreground: oklchColor('destructive-foreground')
				},
				muted: {
					DEFAULT: oklchColor('muted'),
					foreground: oklchColor('muted-foreground')
				},
				accent: {
					DEFAULT: oklchColor('accent'),
					foreground: oklchColor('accent-foreground')
				},
				popover: {
					DEFAULT: oklchColor('popover'),
					foreground: oklchColor('popover-foreground')
				},
				card: {
					DEFAULT: oklchColor('card'),
					foreground: oklchColor('card-foreground')
				},
				chart: {
					'1': oklchColor('chart-1'),
					'2': oklchColor('chart-2'),
					'3': oklchColor('chart-3'),
					'4': oklchColor('chart-4'),
					'5': oklchColor('chart-5')
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
