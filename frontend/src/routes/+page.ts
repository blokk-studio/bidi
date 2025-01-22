import { getMissions } from '$lib/directus'

export const load = async ({ fetch }) => {
	let missions: Awaited<ReturnType<typeof getMissions>> = []
	try {
		missions = await getMissions({ fetch })
	} catch {
		// ignore errors
	}

	return {
		missions,
	}
}
