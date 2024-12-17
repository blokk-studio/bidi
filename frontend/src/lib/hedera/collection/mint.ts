// https://docs.hedera.com/hedera/tutorials/token/create-and-transfer-an-nft-using-a-solidity-contract

import { AccountId, Client, ContractId, Hbar, TokenId } from '@hashgraph/sdk'
import { type NFTContractAbi } from '../../NFTContractAbi'
import type { ExecuteTransaction } from '../Execute'
import {
	TypedContractExecuteTransaction,
	TypedContractFunctionParameters,
	type Address,
	type TypedContractId,
} from '../typedTransactions'

interface MintNFTResult {
	serialNumber: number
	tokenId: string
	metadata: string
	allowedClaimer: string
	transactionUrl: string
}

export const mintNftWithExecutor = async (options: {
	contractId: ContractId
	tokenId: TokenId
	metadataUrl: string
	allowedClaimerAccountId: AccountId
	executeTransaction: ExecuteTransaction
}): Promise<MintNFTResult> => {
	try {
		console.log('\n----- Minting NFT -----')
		console.log('Initiating NFT minting...')

		// Convert token ID to solidity address format
		const tokenAddress = options.tokenId.toSolidityAddress() as Address
		// Convert allowed claimer to solidity address format
		const allowedClaimerAddress = options.allowedClaimerAccountId.toSolidityAddress() as Address

		// Create and execute the minting transaction
		const mintNftForUserFunctionParameters = TypedContractFunctionParameters<
			NFTContractAbi,
			'mintNftForUser'
		>()
			.addAddress(tokenAddress)
			.addBytesArray([Uint8Array.from(options.metadataUrl)])
			.addAddress(allowedClaimerAddress)
		const contractId = options.contractId as TypedContractId<NFTContractAbi>
		const mintNftForUserTransaction = TypedContractExecuteTransaction<NFTContractAbi>({
			contractId,
			functionName: 'mintNftForUser',
			gas: 1000000,
			functionParameters: mintNftForUserFunctionParameters,
		}).setMaxTransactionFee(new Hbar(20)) // Use when HBAR is under 10 cents

		const transactionReceipt = await options.executeTransaction(mintNftForUserTransaction)
		const serial = transactionReceipt.serials[0]

		const result: MintNFTResult = {
			serialNumber: Number(serial),
			tokenId: options.tokenId.toString(),
			metadata: options.metadataUrl,
			allowedClaimer: options.allowedClaimerAccountId.toString(),
			transactionUrl: `https://hashscan.io/testnet/token/${options.tokenId.toString()}/${serial}`,
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

export const mintNFT = async (
	client: Client,
	contractId: string | ContractId,
	tokenId: string | TokenId,
	metadataUrl: string,
	allowedClaimerWalletId: string | AccountId,
): Promise<MintNFTResult> => {
	// Convert inputs to correct types if they're strings
	const contractIdObj =
		typeof contractId === 'string' ? ContractId.fromString(contractId) : contractId
	const tokenIdObj = typeof tokenId === 'string' ? TokenId.fromString(tokenId) : tokenId
	const allowedClaimerId =
		typeof allowedClaimerWalletId === 'string'
			? AccountId.fromString(allowedClaimerWalletId)
			: allowedClaimerWalletId

	const executeTransaction: ExecuteTransaction = async (transaction) => {
		const mintTokenTx = await transaction.execute(client)
		const mintTokenReceipt = await mintTokenTx.getReceipt(client)

		return mintTokenReceipt
	}

	return mintNftWithExecutor({
		allowedClaimerAccountId: allowedClaimerId,
		contractId: contractIdObj,
		executeTransaction,
		metadataUrl,
		tokenId: tokenIdObj,
	})
}
