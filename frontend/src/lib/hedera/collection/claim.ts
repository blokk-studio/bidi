import {
	AccountId,
	Client,
	ContractExecuteTransaction,
	ContractFunctionParameters,
} from '@hashgraph/sdk'

// example: claimNFT("0.0.1234", "0.0.56789", "1", client)
export const claimNFT = async (
	contractId: string,
	tokenId: string,
	serialNumber: string,
	client: Client,
) => {
	console.log('----- Claiming NFT -----')
	console.log(`Initiating claim for NFT #${serialNumber}`)

	try {
		// Convert token ID to solidity address format
		const hederaTokenAddress = AccountId.fromString(tokenId)
		const tokenAddress = hederaTokenAddress.toSolidityAddress()

		// Create the claim transaction
		const claimNft = new ContractExecuteTransaction()
			.setContractId(contractId)
			.setGas(1000000)
			.setFunction(
				'claimNft',
				new ContractFunctionParameters().addAddress(tokenAddress).addInt64(serialNumber),
			)

		// Execute the claim
		const claimTx = await claimNft.execute(client)
		const claimRx = await claimTx.getRecord(client)

		// Check if the claim was successful
		const responseCode = claimRx.contractFunctionResult!.getInt32(0)

		if (responseCode === 22) {
			console.log(`NFT claimed successfully!`)
			console.log(`Claim Details:`)
			console.log(`   - Token ID: ${tokenId}`)
			console.log(`   - Serial Number: ${serialNumber}`)
			console.log(`   - New Owner: ${client.operatorAccountId}`)
			console.log(`View NFT: https://hashscan.io/testnet/token/${tokenId}/${serialNumber}`)
			return true
		} else {
			console.log(`Claim failed with response code: ${responseCode}`)
			return false
		}
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes('You are not authorized to claim this NFT')) {
				console.log('Error: You are not authorized to claim this NFT')
			} else if (error.message.includes('NFT has already been claimed')) {
				console.log('Error: This NFT has already been claimed')
			} else {
				console.log('Error claiming NFT:', error.message)
			}
		} else {
			console.log('Unknown error claiming NFT:', error)
		}
		return false
	}
}
