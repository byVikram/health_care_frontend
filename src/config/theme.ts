// src/config/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles'

// Optional: explicitly type your theme options
const themeOptions: ThemeOptions = {
	palette: {
		mode: 'light',

		primary: {
			light: '#276668',
			main: '#2B6F71',
			dark: '#12373E',
			contrastText: '#ffffff',
		},

		secondary: {
			light: '#eb7fb5',
			main: '#df6fa7',
			dark: '#ca5791',
			contrastText: '#ffffff',
		},

		error: { main: '#da2828' },
		warning: { main: '#f57c00' },
		success: { main: '#13854E' },

		background: {
			default: '#f4f6f9',
			paper: '#ffffff',
		},

		text: {
			primary: '#1a2b3c',
			secondary: '#546e7a',
		},

		divider: '#e0e7ef',

		// extra palette
		neutral: {
			light: '#13C0C5',
			main: '#13C0C5',
			dark: '#13C0C5aa',
		},
	},

	shape: {
		borderRadius: 10,
	},

	spacing: 8,

	typography: {
		fontFamily: 'Inter',

		h1: { fontWeight: 600, fontSize: '2.25rem' },
		h2: { fontWeight: 600, fontSize: '1.875rem' },
		h3: { fontWeight: 600, fontSize: '1.5rem' },
		h4: { fontWeight: 500, fontSize: '1.25rem' },
		h5: { fontWeight: 500, fontSize: '1.125rem' },
		h6: { fontWeight: 600, fontSize: '1rem' },

		body1: { fontSize: '13px', lineHeight: 1.6, fontWeight: 400 },
		body2: { fontSize: '13px', lineHeight: 1.5, color: '#546e7a' },

		button: {
			textTransform: 'none',
			fontWeight: 600,
		},
	},

	// shadows: [
	// 	"none",
	// 	"0 1px 3px rgba(0,0,0,0.08)",
	// 	"0 2px 6px rgba(0,0,0,0.10)",
	// 	"0 4px 12px rgba(0,0,0,0.12)",
	// 	"0 6px 16px rgba(0,0,0,0.14)",
	// 	...Array(20).fill("0 8px 24px rgba(0,0,0,0.16)"),
	// ],
}

const theme = createTheme(themeOptions)

export default theme
