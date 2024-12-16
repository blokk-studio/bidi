// https://docs.hedera.com/hedera/tutorials/token/create-and-transfer-an-nft-using-a-solidity-contract

import {
	AccountId,
	Client,
	ContractExecuteTransaction,
	ContractFunctionParameters,
	ContractId,
	Hbar,
	TokenId,
} from '@hashgraph/sdk'

interface MintNFTResult {
	serialNumber: number
	tokenId: string
	metadata: string
	allowedClaimer: string
	transactionUrl: string
}

export const mintNFT = async (
	client: Client,
	contractId: string | ContractId,
	tokenId: string | TokenId,
	metadataUrl: string,
	allowedClaimerWalletId: string | AccountId,
): Promise<MintNFTResult> => {
	try {
		console.log('\n----- Minting NFT -----')
		console.log('Initiating NFT minting...')

		// Convert inputs to correct types if they're strings
		const contractIdObj =
			typeof contractId === 'string' ? ContractId.fromString(contractId) : contractId
		const tokenIdObj = typeof tokenId === 'string' ? TokenId.fromString(tokenId) : tokenId
		const allowedClaimerId =
			typeof allowedClaimerWalletId === 'string'
				? AccountId.fromString(allowedClaimerWalletId)
				: allowedClaimerWalletId

		// Convert token ID to solidity address format
		const tokenIdSolidityAddr = tokenIdObj.toSolidityAddress()

		// Convert allowed claimer to solidity address format
		const allowedClaimerAddress = allowedClaimerId.toSolidityAddress()

		// Create and execute the minting transaction
		const mintToken = new ContractExecuteTransaction()
			.setContractId(contractIdObj)
			.setGas(1000000)
			.setMaxTransactionFee(new Hbar(20)) // Use when HBAR is under 10 cents
			.setFunction(
				'mintNftForUser',
				new ContractFunctionParameters()
					.addAddress(tokenIdSolidityAddr)
					.addBytesArray([Buffer.from(metadataUrl)])
					.addAddress(allowedClaimerAddress),
			)

		const mintTokenTx = await mintToken.execute(client)
		const mintTokenRx = await mintTokenTx.getRecord(client)
		const serial = mintTokenRx.contractFunctionResult!.getInt64(0)

		const result: MintNFTResult = {
			serialNumber: Number(serial),
			tokenId: tokenIdObj.toString(),
			metadata: metadataUrl,
			allowedClaimer: allowedClaimerId.toString(),
			transactionUrl: `https://hashscan.io/testnet/token/${tokenIdObj.toString()}/${serial}`,
		}

		console.log(`NFT Minted successfully!`)
		console.log(`NFT Details:`)
		console.log(`   - Serial Number: ${result.serialNumber}`)
		console.log(`   - Token ID: ${result.tokenId}`)
		console.log(`   - Metadata: ${result.metadata}`)
		console.log(`   - Allowed Claimer: ${result.allowedClaimer}`)
		console.log(`View NFT: ${result.transactionUrl}`)

		return result
	} catch (error) {
		console.error('Error minting NFT:', error)
		throw error
	}
}
