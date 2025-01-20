import { nftTokenId } from '$lib/deployment.js'
import { getMission } from '$lib/directus.js'
import { getNft } from '$lib/hedera/getNft.js'
import type { Nft } from '$lib/nft.js'
import { LedgerId } from '@hashgraph/sdk'
import { error } from '@sveltejs/kit'

export const load = async ({ fetch, params }) => {
	let mission: Awaited<ReturnType<typeof getMission>> | undefined = undefined
	try {
		mission = await getMission({ slug: params.slug, fetch })
	} catch {
		// ignore errors
	}
	if (!mission) {
		error(404)
	}

	let nfts: Nft[] = []
	if (mission.nft_serial_numbers) {
		nfts = await Promise.all(
			mission.nft_serial_numbers?.map((serialNumberString) => {
				const serialNumber = parseInt(serialNumberString)
				return getNft({
					ledgerId: LedgerId.TESTNET,
					serialNumber,
					tokenId: nftTokenId,
					fetch,
				})
			}),
		)
	}

	return {
		mission,
		nfts,
		metadataTitle: `${mission.title} - BIDI`,
	}
}
