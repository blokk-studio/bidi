import { AccountId, LedgerId } from '@hashgraph/sdk'
import { TokenTypeFilter, tokenUtils as getTokenUtils } from 'virtual:mirrorNode'
import { MirrorNodeClient } from '../MirrorNodeClient'

export interface TokenInfo {
	tokenId: string
	isDeleted: boolean
	name?: string
	symbol?: string
}

export type GetCollections = (options: {
	ledgerId: LedgerId
	accountId: AccountId
}) => Promise<TokenInfo[]>

export const getCollections: GetCollections = async (options): Promise<TokenInfo[]> => {
	try {
		const client = MirrorNodeClient.newFromLedgerId(options.ledgerId)
		const tokenUtils = getTokenUtils(client)
		const tokensResponse = await tokenUtils.Tokens.setAccountId(options.accountId.toString())
			.setTokenType(TokenTypeFilter.NON_FUNGIBLE_UNIQUE)
			.get()

		if (!tokensResponse.tokens) {
			return []
		}

		const tokenInfoPromises = tokensResponse.tokens.map(async (token) => {
			const tokenInfoResponse = await tokenUtils.TokenInfo.setTokenId(token.token_id).get()

			const tokenInfo: TokenInfo = {
				name: tokenInfoResponse.name,
				isDeleted: tokenInfoResponse.deleted,
				tokenId: tokenInfoResponse.token_id,
				symbol: tokenInfoResponse.symbol,
			}

			return tokenInfo
		})

		const tokenInfos = await Promise.all(tokenInfoPromises)

		return tokenInfos
	} catch (error) {
		console.error('Failed to fetch token collections:', error)
		throw error
	}
}
