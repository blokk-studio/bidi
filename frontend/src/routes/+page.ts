import { nftTokenId } from '$lib/deployment'
import { getNfts } from '$lib/hedera/getNfts'
import { LedgerId } from '@hashgraph/sdk'

export const load = async ({ fetch }) => {
	const nfts = await getNfts({
		ledgerId: LedgerId.TESTNET,
		tokenId: nftTokenId,
		fetch,
	})

	return {
		nfts,
	}
}
