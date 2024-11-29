// https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service/delete-a-token

import {
    TokenDeleteTransaction,
    TokenId,
    PrivateKey,
    TokenInfoQuery
} from "@hashgraph/sdk";
import { HEDERA_PRIVATE_KEY } from "$env/static/private";
import { environmentSetup} from "$lib/hedera";

export async function deleteCollection(tokenId: string) {
    try {
        const client = environmentSetup();

        // check if token is mutable
        const tokenInfo = await new TokenInfoQuery()
            .setTokenId(TokenId.fromString(tokenId))
            .execute(client);

        // ..and if it has the admin key to mutate
        if (!tokenInfo.adminKey) {
            throw new Error("TOKEN_IS_IMMUTABLE: This token cannot be deleted as it was created without an admin key");
        }

        const adminKey = PrivateKey.fromStringDer(HEDERA_PRIVATE_KEY);

        //Create the transaction and freeze the unsigned transaction for manual signing
        const transaction = new TokenDeleteTransaction()
            .setTokenId(tokenId)
            .freezeWith(client);

        //Sign with the admin private key of the token
        const signTx = await transaction.sign(adminKey);

        //Submit the transaction to a Hedera network
        const txResponse = await signTx.execute(client);

        //Request the receipt of the transaction
        const receipt = await txResponse.getReceipt(client);

        //Get the transaction consensus status
        const transactionStatus = receipt.status;

        return {
            success: true,
            status: transactionStatus.toString(),
            message: `Token ${tokenId} deleted successfully`
        };
    } catch (error) {
        console.error('Failed to delete token:', error);

        if (error.message?.includes('TOKEN_IS_IMMUTABLE')) {
            // todo look for other cases too
            throw new Error("This token cannot be deleted as it is immutable");
        }
        throw error;
    }
}