import { type Plugin } from 'vite'

/**
 * a compatibility layer to import `@tikz/hedera-mirror-node-ts` through vite instead of allowing sveltekit to process it
 *
 * `@tikz/hedera-mirror-node-ts` can't be imported by node directly because it uses imports without extensions in its dist files. importing through sveltekit code doesn't work because of this, because sveltekit's processing is not as forgiving as vite's. but we can circumvent this by creating a virtual module that uses vite's module resolution to create a working bundle of `@tikz/hedera-mirror-node-ts` (as a pre-bundled dependency).
 */
export const getVirtualMirrorNodePlugin = (): Plugin => {
	const virtualModuleId = 'virtual:mirrorNode'

	return {
		name: 'virtual-mirror-node', // required, will show up in warnings and errors
		async resolveId(id) {
			if (id === virtualModuleId) {
				return await this.resolve('@tikz/hedera-mirror-node-ts')
			}
		},
	}
}
