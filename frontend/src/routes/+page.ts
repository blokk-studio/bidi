import { nftTokenId } from '$lib/deployment'
import { getMissions } from '$lib/directus'
import { getNfts } from '$lib/hedera/getNfts'
import { LedgerId } from '@hashgraph/sdk'

export const load = async ({ fetch }) => {
	let missions: Awaited<ReturnType<typeof getMissions>> = []
	try {
		missions = await getMissions({ fetch })
	} catch {
		// ignore errors
	}

	const nfts = await getNfts({
		ledgerId: LedgerId.TESTNET,
		tokenId: nftTokenId,
		fetch,
	})

	return {
		nfts,
		missions,
	}
}
