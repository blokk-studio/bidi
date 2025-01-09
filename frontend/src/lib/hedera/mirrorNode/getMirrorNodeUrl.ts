import { LedgerId } from '@hashgraph/sdk'

export const getMirrorNodeUrl = (ledgerId: LedgerId) => {
	switch (ledgerId) {
		case LedgerId.MAINNET:
			return 'https://mainnet.mirrornode.hedera.com/'
		case LedgerId.PREVIEWNET:
			return 'https://previewnet.mirrornode.hedera.com/'
		case LedgerId.TESTNET:
			return 'https://testnet.mirrornode.hedera.com/'
	}

	throw new Error(`${ledgerId?.toString?.() ?? ledgerId} is not a valid ledger id!`)
}
