import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { getVirtualHashConnectPlugin } from './src/lib/hashconnect/virtualHashConnect'
import { getVirtualMirrorNodePlugin } from './src/lib/mirrorNode/virtualMirrorNode'

export default defineConfig({
	plugins: [getVirtualHashConnectPlugin(), getVirtualMirrorNodePlugin(), sveltekit()],
})
