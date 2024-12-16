import { PUBLIC_IPFS_GATEWAY_BASE_URL } from '$env/static/public'
import type { IpfsUri, Nft } from '$lib/nft'
import { LedgerId, TokenId } from '@hashgraph/sdk'
import { nftUtils as getNftUtils } from 'virtual:mirrorNode'
import { MirrorNodeClient } from './MirrorNodeClient'

export type GetNfts = (options: {
	ledgerId: LedgerId
	tokenId: TokenId
	fetch?: typeof globalThis.fetch
}) => Promise<Nft[]>

const getIpfsUrl = (options: { gatewayBaseUrl: string; ipfsUriOrString: IpfsUri | string }) => {
	let ipfsCid: string = options.ipfsUriOrString
	if (options.ipfsUriOrString.startsWith('ipfs://')) {
		ipfsCid = options.ipfsUriOrString.substring(7)
	}
	// remove 'ipfs://'
	const ipfsUrl = `${options.gatewayBaseUrl}/${ipfsCid}`

	return ipfsUrl
}

export const getNfts: GetNfts = async (options): Promise<Nft[]> => {
	const fetch_ = options.fetch ?? globalThis.fetch
	try {
		const client = MirrorNodeClient.newFromLedgerId(options.ledgerId)
		const nftUtils = getNftUtils(client)
		const nftsResponse = await nftUtils.NFTs.setTokenId(options.tokenId.toString()).get()
		const nftPromises = nftsResponse.nfts.map(async (nft): Promise<Nft> => {
			const decodedMetadata = atob(nft.metadata) as IpfsUri
			const metadataUrl = getIpfsUrl({
				gatewayBaseUrl: PUBLIC_IPFS_GATEWAY_BASE_URL,
				ipfsUriOrString: decodedMetadata,
			})
			const metadataResponse = await fetch_(metadataUrl, {
				headers: {
					'Content-Type': 'application/json',
				},
			})
			const metadata = await metadataResponse.json()
			const name = metadata.name
			const imageUrl = getIpfsUrl({
				gatewayBaseUrl: PUBLIC_IPFS_GATEWAY_BASE_URL,
				ipfsUriOrString: metadata.image,
			})

			return {
				serialNumber: nft.serial_number,
				name,
				imageUrl,
			}
		})
		const nfts = await Promise.all(nftPromises)

		return nfts
	} catch (error) {
		console.error('Failed to fetch NFTs:', error)
		throw error
	}
}
