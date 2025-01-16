import { nftTokenId } from '$lib/deployment'
import { getMissions, type Mission } from '$lib/directus'
import { getNfts } from '$lib/hedera/getNfts'
import { LedgerId } from '@hashgraph/sdk'

export const load = async ({ fetch }) => {
	let missions: Pick<Mission, 'title' | 'date' | 'type_of_work'>[] = []
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
