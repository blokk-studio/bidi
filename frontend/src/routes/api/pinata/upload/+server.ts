// https://docs.pinata.cloud/web3/sdk/getting-started

import { pinata } from '$lib/pinata/pinata.server'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData()
		const metadata = JSON.parse(formData.get('metadata') as string)

		// Upload static image todo generate image later on, adding this pre-uploaded url for now
		// const imageUpload = await pinata.upload.file(staticFile).group(PINATA_GROUP_ID)
		const imageIpfsUrl = `ipfs://bafkreifpz6c7i5bcxklf45qgbz3yo4zmic6imue7ryaa62vg3s7m3sa5qa`

		const fullMetadata = {
			name: 'demo.jpg',
			creator: 'BiDi Company',
			description: 'Biodiversity Certificate Metadata',
			type: 'image/jpg',
			format: 'none',
			properties: {
				latitude: metadata.latitude,
				longitude: metadata.longitude,
				typeOfNaturalObject: metadata.typeOfNaturalObject,
				locationOwner: metadata.locationOwner,
				operationsManager: metadata.operationsManager,
				dateOfWork: metadata.dateOfWork,
				typeOfWork: metadata.typeOfWork,
				effectOnBiodiversity: metadata.effectOnBiodiversity,
			},
			image: imageIpfsUrl,
		}

		const metadataUpload = await pinata.upload.json(fullMetadata)

		const metadataUrl = `ipfs://${metadataUpload.IpfsHash}`

		return json({
			// imageUrl: await pinata.gateways.convert(imageUpload.IpfsHash),
			metadataUrl,
			// imageIpfsHash: imageUpload.IpfsHash,
			metadataIpfsHash: metadataUpload.IpfsHash,
		})
	} catch (throwable) {
		console.error('Upload failed:', throwable)
		const error = throwable instanceof Error ? throwable : new Error(String(throwable))
		return json({ error: error.message }, { status: 500 })
	}
}
