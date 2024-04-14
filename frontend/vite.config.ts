import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		Icons({
			compiler: 'svelte',
			autoInstall: true
		})
	],
	server: {
		hmr: {
			host: 'localhost',
			protocol: 'ws'
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
