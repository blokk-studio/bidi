import { getCollections } from '$lib/hedera/collection'
import { json } from '@sveltejs/kit'

export async function GET() {
	try {
		const collections = await getCollections()
		return json({ collections })
	} catch (throwable) {
		const error = throwable instanceof Error ? throwable : new Error(String(throwable))
		return json({ error: error.message }, { status: 500 })
	}
}
