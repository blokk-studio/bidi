import { contractId } from '$lib/deployment'
import { type LedgerId } from '@hashgraph/sdk'
import { callContract } from './mirrorNode/callContract'

const isNftClaimedAbi = {
	inputs: [
		{
			internalType: 'int64',
			name: 'serial',
			type: 'int64',
		},
	],
	name: 'isNftClaimed',
	outputs: [
		{
			internalType: 'bool',
			name: '',
			type: 'bool',
		},
	],
	stateMutability: 'view',
	type: 'function',
} as const

export const getIsClaimed = async (options: {
	serialNumber: number
	ledgerId: LedgerId
	fetch?: typeof globalThis.fetch
}) => {
	const fetch_ = options.fetch ?? fetch
	const outputs = await callContract({
		functionAbi: isNftClaimedAbi,
		inputs: [options.serialNumber],
		contractId: contractId,
		ledgerId: options.ledgerId,
		fetch: fetch_,
	})
	const isNftClaimed = outputs[0]

	return isNftClaimed
}
