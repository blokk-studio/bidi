import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { getVirtualHashConnectPlugin } from './src/lib/hashconnect/virtualHashConnect'

export default defineConfig({
	plugins: [getVirtualHashConnectPlugin(), sveltekit()],
	ssr: {
		noExternal: ['@tikz/hedera-mirror-node-ts'],
	},
})
