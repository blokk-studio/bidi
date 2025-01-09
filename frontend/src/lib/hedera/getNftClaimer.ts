import { contractId } from '$lib/deployment'
import { AccountId, type LedgerId } from '@hashgraph/sdk'
import { callContract } from './mirrorNode/callContract'

const getClaimerAddressAbi = {
	inputs: [
		{
			internalType: 'int64',
			name: 'serial',
			type: 'int64',
		},
	],
	name: 'getClaimerAddress',
	outputs: [
		{
			internalType: 'address',
			name: '',
			type: 'address',
		},
	],
	stateMutability: 'view',
	type: 'function',
} as const

export const getNftClaimerAccountId = async (options: {
	serialNumber: number
	ledgerId: LedgerId
	fetch?: typeof globalThis.fetch
}) => {
	const fetch_ = options.fetch ?? fetch
	const outputs = await callContract({
		functionAbi: getClaimerAddressAbi,
		inputs: [options.serialNumber],
		contractId: contractId,
		ledgerId: options.ledgerId,
		fetch: fetch_,
	})
	const claimerAddress = outputs[0]
	const claimerAccountId = AccountId.fromEvmAddress(0, 0, claimerAddress)

	return claimerAccountId
}
