// https://docs.hedera.com/hedera/tutorials/token/create-and-transfer-your-first-nft

import { HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY } from '$env/static/private'
import { environmentSetup } from '$lib/hedera'
import {
	AccountId,
	PrivateKey,
	TokenCreateTransaction,
	TokenSupplyType,
	TokenType,
} from '@hashgraph/sdk'

interface CreateCollectionParams {
	name: string
	symbol: string
	maxSupply?: number
}

export async function createCollection({ name, symbol, maxSupply = 250 }: CreateCollectionParams) {
	try {
		const client = environmentSetup()

		// Set up treasury account (same as operator in this case)
		const treasuryId = AccountId.fromString(HEDERA_ACCOUNT_ID)
		const treasuryKey = PrivateKey.fromStringDer(HEDERA_PRIVATE_KEY)

		// Generate keys for collection management
		const supplyKey = PrivateKey.generate()

		// Create the NFT collection
		const nftCreate = new TokenCreateTransaction()
			.setTokenName(name)
			.setTokenSymbol(symbol)
			.setTokenType(TokenType.NonFungibleUnique)
			.setDecimals(0)
			.setInitialSupply(0)
			.setTreasuryAccountId(treasuryId)
			.setSupplyType(TokenSupplyType.Finite)
			.setMaxSupply(maxSupply)
			.setSupplyKey(supplyKey)
			.setAdminKey(treasuryKey) // Can update token properties
			.setFreezeKey(treasuryKey) // Can freeze token transfers
			.setWipeKey(treasuryKey) // Can wipe tokens from accounts
			.setPauseKey(treasuryKey) // Can pause token operations
			.freezeWith(client)

		// Sign with the treasury key
		const signedTx = await nftCreate.sign(treasuryKey)

		// Submit to the network
		const txResponse = await signedTx.execute(client)

		// Get the receipt
		const receipt = await txResponse.getReceipt(client)

		// Get the token ID
		const tokenId = receipt.tokenId
		if (!tokenId) {
			throw new Error(
				`NFT collection creation transaction receipt does not contain a token id. The transaction status is ${JSON.stringify(receipt.status)}.`,
			)
		}

		console.log(`Created NFT collection with ID: ${tokenId}`)
		console.log(`View on HashScan: https://hashscan.io/testnet/token/${tokenId}`)

		// Return important information
		return {
			tokenId: tokenId.toString(),
			supplyKey: supplyKey.toStringDer(), // Save this securely - needed for minting
			hashscanUrl: `https://hashscan.io/testnet/token/${tokenId}`,
		}
	} catch (error) {
		console.error('Failed to create NFT collection:', error)
		throw error
	}
}
