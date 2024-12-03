import { getCollections } from '$lib/hedera/collection'
import { json } from '@sveltejs/kit'

export async function GET() {
	try {
		const collections = await getCollections()
		return json({ collections })
	} catch (error) {
		return json({ error: error.message }, { status: 500 })
	}
}
