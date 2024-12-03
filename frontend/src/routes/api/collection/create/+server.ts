import { createCollection } from '$lib/hedera/collection/create.server'
import { json } from '@sveltejs/kit'

export async function POST({ request }) {
	try {
		const { name, symbol, maxSupply } = await request.json()

		if (!name || !symbol) {
			return json(
				{
					error: 'Name and symbol are required',
				},
				{ status: 400 },
			)
		}

		const result = await createCollection({
			name,
			symbol,
			maxSupply,
		})

		return json(result)
	} catch (error) {
		console.error('Collection creation failed:', error)
		return json({ error: error.message }, { status: 500 })
	}
}
