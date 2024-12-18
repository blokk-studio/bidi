import { PUBLIC_IPFS_GATEWAY_BASE_URL } from '$env/static/public'
import type { BidiCertificate } from '$lib/certificate'
import type { IpfsUri } from '$lib/nft'

const getIpfsUrl = (options: { gatewayBaseUrl: string; ipfsUriOrString: IpfsUri | string }) => {
	let ipfsCid: string = options.ipfsUriOrString
	if (options.ipfsUriOrString.startsWith('ipfs://')) {
		ipfsCid = options.ipfsUriOrString.substring(7)
	}
	// TODO: figure out a way to do this dynamically and configure it via env.
	const ipfsUrl = `https://${ipfsCid}.ipfs.flk-ipfs.xyz`

	return ipfsUrl
}

export const getNftMetadata = async (options: {
	metadataString: string
	fetch?: typeof globalThis.fetch
}): Promise<{
	name: string
	imageUrl: string
	certificate: BidiCertificate
}> => {
	try {
		const fetch_ = options.fetch ?? fetch
		const decodedMetadata = atob(options.metadataString) as IpfsUri
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
		const certificate: BidiCertificate = metadata.properties

		return {
			name,
			imageUrl,
			certificate,
		}
	} catch {
		return {
			name: 'This certificate has unexpected metadata',
			imageUrl: '/0.png',
			certificate: {
				dateOfWork: '1970-01-01',
				effectOnBiodiversity: '',
				swissGridE: 0,
				swissGridN: 0,
				locationOwner: '',
				operationsManager: '',
				typeOfNaturalObject: '',
				typeOfWork: '',
			},
		}
	}
}