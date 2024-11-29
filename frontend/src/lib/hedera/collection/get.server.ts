// https://docs.hedera.com/hedera/tutorials/token/create-and-transfer-your-first-nft

import { environmentSetup} from "$lib/hedera";
import { AccountBalanceQuery, AccountId, TokenInfoQuery, TokenId } from "@hashgraph/sdk";
import { HEDERA_ACCOUNT_ID } from "$env/static/private";

interface TokenInfo {
    tokenId: string;
    isDeleted: boolean;
    name?: string;
    symbol?: string;
}

export async function getCollections(): Promise<TokenInfo[]> {
    try {
        const client = environmentSetup();
        const accountId = AccountId.fromString(HEDERA_ACCOUNT_ID);

        const balance = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(client);

        const tokenBalances = balance.tokens;

        if (!tokenBalances) return [];

        // Get token IDs
        const tokenIds = Array.from(tokenBalances._map.keys());

        // Check each token's status
        const tokenInfoPromises = tokenIds.map(async (tokenId): Promise<TokenInfo> => {
            try {
                const tokenInfo = await new TokenInfoQuery()
                    .setTokenId(TokenId.fromString(tokenId))
                    .execute(client);

                return {
                    tokenId,
                    isDeleted: tokenInfo.isDeleted,
                    name: tokenInfo.name,
                    symbol: tokenInfo.symbol
                };
            } catch (error) {
                // If we can't get token info, it's probably deleted
                return {
                    tokenId,
                    isDeleted: true
                };
            }
        });

        return await Promise.all(tokenInfoPromises);
    } catch (error) {
        console.error('Failed to fetch token collections:', error);
        throw error;
    }
}