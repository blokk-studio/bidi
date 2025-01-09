import type { LedgerId } from '@hashgraph/sdk'
import { getIsClaimed } from './getIsClaimed'
import { getNftClaimerAccountId } from './getNftClaimer'
import { getNftMetadata } from './getNftMetadata'

export const getNftDetails = async (options: {
	serialNumber: number
	ledgerId: LedgerId
	/** the base64 encoded metadata string taken directly from the nft's blockchain properties */
	metadataString: string
	fetch?: typeof globalThis.fetch
}) => {
	const fetch_ = options.fetch ?? globalThis.fetch
	const [metadata, claimerAccountId, isClaimed] = await Promise.all([
		getNftMetadata({
			metadataString: options.metadataString,
			fetch: fetch_,
		}),
		getNftClaimerAccountId({
			serialNumber: options.serialNumber,
			ledgerId: options.ledgerId,
			fetch: fetch_,
		}),
		getIsClaimed({
			serialNumber: options.serialNumber,
			ledgerId: options.ledgerId,
			fetch: fetch_,
		}),
	])

	const nftDetails = {
		...metadata,
		claimerAccountId,
		isClaimed,
	}

	return nftDetails
}
