import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { getVirtualHashConnectPlugin } from './src/lib/hashconnect/virtualHashConnect'

export default defineConfig({
	plugins: [nodePolyfills(), getVirtualHashConnectPlugin(), sveltekit()],
	ssr: {
		noExternal: ['@tikz/hedera-mirror-node-ts'],
	},
})
