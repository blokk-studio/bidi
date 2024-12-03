import { deleteCollection } from '$lib/hedera/collection'
import { json } from '@sveltejs/kit'

export async function DELETE({ url }) {
	try {
		const tokenId = url.searchParams.get('tokenId')

		if (!tokenId) {
			return json({ error: 'Token ID is required' }, { status: 400 })
		}

		const result = await deleteCollection(tokenId)
		return json(result)
	} catch (error) {
		return json({ error: error.message }, { status: 500 })
	}
}
