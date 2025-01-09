import type { Nft } from '$lib/nft'
import { AccountId, LedgerId, TokenId } from '@hashgraph/sdk'
import { nftUtils as getNftUtils } from '@tikz/hedera-mirror-node-ts'
import { MirrorNodeClient } from './MirrorNodeClient'
import { getNftDetails } from './getNftDetails'

export type GetNfts = (options: {
	ledgerId: LedgerId
	tokenId: TokenId
	accountId?: AccountId
	fetch?: typeof globalThis.fetch
}) => Promise<Nft[]>

export const getNfts: GetNfts = async (options) => {
	const fetch_ = options.fetch ?? globalThis.fetch
	try {
		const client = MirrorNodeClient.newFromLedgerId(options.ledgerId, { fetch: fetch_ })
		const nftUtils = getNftUtils(client)
		const nftsRequest = nftUtils.NFTs.setTokenId(options.tokenId.toString())
		if (options.accountId) {
			nftsRequest.setAccountId(options.accountId.toString())
		}
		const nftsResponse = await nftsRequest.get()
		const nftPromises = nftsResponse.nfts.map(async (nft): Promise<Nft> => {
			const serialNumber = nft.serial_number
			const metadataString = nft.metadata

			const nftDetails = await getNftDetails({
				serialNumber,
				metadataString,
				ledgerId: options.ledgerId,
				fetch: fetch_,
			})

			return {
				...nftDetails,
				serialNumber,
			}
		})
		const nfts = await Promise.all(nftPromises)

		return nfts
	} catch (error) {
		console.error('Failed to fetch NFTs:', error)
		throw error
	}
}
