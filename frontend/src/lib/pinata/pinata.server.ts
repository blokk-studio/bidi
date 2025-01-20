import { PINATA_GROUP_ID, PINATA_JWT } from '$env/static/private'
import { PUBLIC_GATEWAY_URL } from '$env/static/public'
import type { BidiCertificate } from '$lib/certificate'
import { getNftDescription } from '$lib/getNftDescription'
import type { StandardNftMetadata } from '$lib/hedera/StandardNftMetadata'
import { type FileObject, PinataSDK } from 'pinata-web3'

export const pinata = new PinataSDK({
	pinataJwt: PINATA_JWT,
	pinataGateway: PUBLIC_GATEWAY_URL,
})

/** uploads metadata for the given certificate in hashpack's standard nft metadata format */
export const uploadNftMetadata = async (options: {
	missionTitle: string
	certificate: BidiCertificate
	certificateImage: FileObject
}) => {
	const certificateImageUploadResult = await pinata.upload
		.file(options.certificateImage)
		.group(PINATA_GROUP_ID)

	const description = getNftDescription(options.certificate)
	const fullMetadata: StandardNftMetadata<BidiCertificate> = {
		name: options.missionTitle,
		creator: 'BIDI-Organization',
		description,
		image: certificateImageUploadResult?.IpfsHash,
		type: 'image/jpg',
		properties: options.certificate,
	}

	const metadataUpload = await pinata.upload.json(fullMetadata)
	const ipfsHash = metadataUpload.IpfsHash
	const metadataUrl = `ipfs://${ipfsHash}` as const

	return {
		ipfsHash,
		metadataUrl,
	}
}
