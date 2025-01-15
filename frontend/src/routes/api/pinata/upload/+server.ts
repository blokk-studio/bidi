// https://docs.pinata.cloud/web3/sdk/getting-started

import { uploadNftMetadata } from '$lib/pinata/pinata.server'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData()
		const metadata = JSON.parse(formData.get('metadata') as string)

		const uploadedNftMetadata = await uploadNftMetadata({
			missionTitle: metadata.typeOfNaturalObject,
			certificate: metadata,
		})

		return json(uploadedNftMetadata)
	} catch (throwable) {
		console.error('Upload failed:', throwable)
		const error = throwable instanceof Error ? throwable : new Error(String(throwable))
		return json({ error: error.message }, { status: 500 })
	}
}
