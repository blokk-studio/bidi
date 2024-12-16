// https://docs.pinata.cloud/web3/sdk/getting-started

import { pinata } from '$lib/pinata/pinata.server'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

import { PINATA_GROUP_ID } from '$env/static/private'

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData()

		// todo we wont need file uplaod in the future, as the image will be generated randomly!
		const uploadedFile = formData.get('file') as File
		const metadata = JSON.parse(formData.get('metadata') as string)

		if (!uploadedFile?.name || uploadedFile.size === 0) {
			return json({ error: 'You must provide a file to upload' }, { status: 400 })
		}

		// Upload image todo for some reason the group id gets ignored?
		const imageUpload = await pinata.upload.file(uploadedFile).group(PINATA_GROUP_ID)

		const imageIpfsUrl = `ipfs://${imageUpload.IpfsHash}`

		// Create and upload metadata (containing IPFS image url)
		const fullMetadata = {
			...metadata,
			type: 'image/jpg',
			format: 'none',
			image: imageIpfsUrl,
		}

		// Upload metadata to IPFS
		const metadataUpload = await pinata.upload.json(fullMetadata)
		const metadataUrl = `ipfs://${metadataUpload.IpfsHash}`

		return json({
			imageUrl: await pinata.gateways.convert(imageUpload.IpfsHash),
			metadataUrl, // this is the only thing that matters id say, and we will pass this as metadata on mint process
			imageIpfsHash: imageUpload.IpfsHash,
			metadataIpfsHash: metadataUpload.IpfsHash,
		})
	} catch (throwable) {
		console.error('Upload failed:', throwable)
		const error = throwable instanceof Error ? throwable : new Error(String(throwable))
		return json({ error: error.message }, { status: 500 })
	}
}
