import { type Plugin } from 'vite'

/**
 * a compatibility layer to import `hashconnect` through vite instead of allowing sveltekit to process it
 *
 * `hashconnect` can't be imported by node directly because it uses imports without extensions in its dist files. importing through sveltekit code doesn't work because of this, because sveltekit's processing is not as forgiving as vite's. but we can circumvent this by creating a virtual module that uses vite's module resolution to create a working bundle of `hashconnect` (as a pre-bundled dependency).
 */
export const getVirtualHashConnectPlugin = (): Plugin => {
	const virtualModuleId = 'virtual:hashconnect'

	return {
		name: 'virtual-hashconnect', // required, will show up in warnings and errors
		async resolveId(id) {
			if (id === virtualModuleId) {
				return await this.resolve('hashconnect')
			}
		},
	}
}
