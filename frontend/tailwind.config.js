/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	daisyui: {
		themes: [
			{
				light: {
					primary: '#D8E9F0',

					secondary: '#E7E0E6',

					accent: '#f0abfac',

					neutral: '#7B8C9C',

					'base-100': '#EDEAE0',

					info: '#0098dc',

					success: '#22c55e',

					warning: '#ffa200',

					error: '#be123c'
				}
			},
			'dark'
		]
	},
	plugins: [require('daisyui')]
};
