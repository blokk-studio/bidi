import { deployNFTCollection } from '$lib/hedera/contract'
import { json } from '@sveltejs/kit'

// todo pass body info, such as NFT options and metadata
export async function POST() {
	try {
		const result = await deployNFTCollection()

		return json(result)
	} catch (throwable) {
		console.error('Collection creation failed:', throwable)
		const error = throwable instanceof Error ? throwable : new Error(String(throwable))
		return json({ error: error.message }, { status: 500 })
	}
}
