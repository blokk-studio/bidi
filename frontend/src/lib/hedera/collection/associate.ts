import { AccountId, Status, TokenAssociateTransaction, TokenId } from '@hashgraph/sdk'
import type { ExecuteTransaction } from '../Execute'

export const associateWithToken = async (options: {
	accountId: AccountId
	tokenId: TokenId
	executeTransaction: ExecuteTransaction
}) => {
	const tokenAssociateTransaction = new TokenAssociateTransaction()
		.setTokenIds([options.tokenId])
		.setAccountId(options.accountId)
	const receipt = await options.executeTransaction(tokenAssociateTransaction)

	if (receipt.status !== Status.Success) {
		throw new Error(`transaction wasn't successful: ${receipt.toString()}`)
	}

	return {
		hasAssociatedWithToken: true,
	}
}
