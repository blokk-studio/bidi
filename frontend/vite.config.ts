import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
	plugins: [nodePolyfills(), sveltekit()],
	ssr: {
		noExternal: ['@tikz/hedera-mirror-node-ts'],
	},
})
