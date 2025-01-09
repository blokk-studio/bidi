import type { Nft } from '$lib/nft'
import { LedgerId, TokenId } from '@hashgraph/sdk'
import { nftUtils as getNftUtils } from '@tikz/hedera-mirror-node-ts'
import { MirrorNodeClient } from './MirrorNodeClient'
import { getNftClaimerAccountId } from './getNftClaimer'
import { getNftMetadata } from './getNftMetadata'

export type GetNft = (options: {
	ledgerId: LedgerId
	tokenId: TokenId
	serialNumber: number
	fetch?: typeof globalThis.fetch
}) => Promise<Nft>

export const getNft: GetNft = async (options) => {
	const fetch_ = options.fetch ?? globalThis.fetch
	const client = MirrorNodeClient.newFromLedgerId(options.ledgerId, { fetch: fetch_ })
	const nftUtils = getNftUtils(client)
	const nftsRequest = nftUtils.NFTInfo.setTokenId(options.tokenId.toString()).setSerialNumber(
		options.serialNumber,
	)
	const nftResponse = await nftsRequest.get()
	const serialNumber = nftResponse.serial_number
	const { name, imageUrl, certificate } = await getNftMetadata({
		metadataString: nftResponse.metadata,
		fetch: fetch_,
	})
	const claimerAccountId = await getNftClaimerAccountId({
		serialNumber,
		ledgerId: options.ledgerId,
		fetch: fetch_,
	})

	return {
		serialNumber,
		name,
		imageUrl,
		certificate,
		claimerAccountId,
	}
}
