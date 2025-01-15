import { nftTokenId } from '$lib/deployment'
import { getNft } from '$lib/hedera/getNft'
import { LedgerId } from '@hashgraph/sdk'

export const load = async ({ fetch, params }) => {
	const serialNumber = parseInt(params.serialNumber)

	const nft = await getNft({
		ledgerId: LedgerId.TESTNET,
		tokenId: nftTokenId,
		serialNumber,
		fetch,
	})

	return {
		nft,
		metadataTitle: `${nft.name} - BIDI`,
	}
}
