// https://docs.pinata.cloud/web3/sdk/getting-started

import type { BidiCertificate } from '$lib/certificate'
import { uploadNftMetadata } from '$lib/pinata/pinata.server'
import { error, json } from '@sveltejs/kit'
import type { FileObject } from 'pinata-web3'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData()

		const certificateImage = formData.get('certificateImage') as FileObject
		const missionTitleEntry = formData.get('missionTitle')
		if (!missionTitleEntry) {
			error(400, { message: `missionTitle is required in the form data!` })
		}
		const missionTitle = missionTitleEntry.toString()
		const certificate: BidiCertificate = JSON.parse(formData.get('metadata') as string)

		const uploadedNftMetadata = await uploadNftMetadata({
			missionTitle,
			certificate,
			certificateImage,
		})

		return json(uploadedNftMetadata)
	} catch (throwable) {
		console.error('Upload failed:', throwable)
		const error = throwable instanceof Error ? throwable : new Error(String(throwable))
		return json({ error: error.message }, { status: 500 })
	}
}
