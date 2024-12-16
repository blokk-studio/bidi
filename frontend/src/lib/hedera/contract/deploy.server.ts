import {
	// Hbar,
	AccountBalanceQuery,
	AccountId,
	ContractCreateFlow,
	ContractExecuteTransaction,
	ContractFunctionParameters,
} from '@hashgraph/sdk'

import { environmentSetup } from '$lib/hedera'
import { NFTContract } from '@bidi/contracts'

export const deployNFTCollection = async () => {
	const client = environmentSetup()
	const operatorId = client.operatorAccountId

	if (!operatorId) throw new Error('operatorId must be provided')

	// Check account balance, maybe good info if we got enough HBAR to create a new contract.
	console.log('\n----- Account Information -----')
	const accountBalance = await new AccountBalanceQuery().setAccountId(operatorId).execute(client)

	console.log(`Account Balance:`)
	console.log(`   - ${accountBalance.hbars.toString()} (HBAR)`)

	// Deploy configuration
	console.log('\n----- Deployment Configuration -----')
	console.log(`Operator Account: ${operatorId}`)
	console.log(`Network: Testnet`)
	console.log(`Metadata URI: ${process.env.PUBLIC_NFT_METADATA_URI}`)
	console.log(`HashScan Explorer: https://hashscan.io/testnet`)

	// Deploy Smart Contract
	console.log('\n----- Deploying Smart Contract -----')
	const bytecode = NFTContract.bytecode.startsWith('0x')
		? NFTContract.bytecode.slice(2)
		: NFTContract.bytecode

	console.log(`Contract Bytecode Size: ${bytecode.length / 2} bytes`)

	console.log('\n----- Deploying Contract -----')
	console.log('Initiating contract deployment...')
	const createContract = new ContractCreateFlow()
		.setGas(4000000) // Increase if revert
		.setBytecode(bytecode) // Contract bytecode
	const createContractTx = await createContract.execute(client)
	const createContractRx = await createContractTx.getReceipt(client)
	const contractId = createContractRx.contractId
	console.log(`Contract deployed successfully!`)
	console.log(`Contract ID: ${contractId}`)
	console.log(`View Contract: https://hashscan.io/testnet/contract/${contractId}`)

	if (!contractId) {
		throw new Error('No contract found was created.')
	}

	// Create NFT Collection todo: will be added via props
	console.log('\n----- Creating NFT Collection -----')
	console.log('Initiating NFT collection creation...')
	const createToken = new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(1000000) // Increase if revert
		.setPayableAmount(10) // Increase if revert
		.setFunction(
			'createNft',
			new ContractFunctionParameters()
				.addString('Fall Collection') // NFT name
				.addString('LEAF') // NFT symbol
				.addString('Just a memo') // NFT memo
				.addInt64(250) // NFT max supply
				.addInt64(7000000), // Expiration: Needs to be between 6999999 and 8000001
		)
	const createTokenTx = await createToken.execute(client)
	const createTokenRx = await createTokenTx.getRecord(client)
	const tokenIdSolidityAddr = createTokenRx.contractFunctionResult!.getAddress(0)
	const tokenId = AccountId.fromSolidityAddress(tokenIdSolidityAddr)
	console.log(`NFT Collection created successfully!`)
	console.log(`Collection Details:`)
	console.log(`   - Token ID: ${tokenId}`)
	console.log(`   - Name: Fall Collection`)
	console.log(`   - Symbol: LEAF`)
	console.log(`   - Max Supply: 250`)
	console.log(`View Token: https://hashscan.io/testnet/token/${tokenId}`)

	// Mint NFT with assigned claimer todo claimer address will also be added via props, also, probably the metadata base url will be added in .env, as that one is static, while a single NFT metadata will be added on as child
	// const metadata =
	//     "ipfs://bafyreie3ichmqul4xa7e6xcy34tylbuq2vf3gnjf7c55trg3b6xyjr4bku/metadata.json";
	// const allowedClaimerAddress = AccountId.fromString(operatorId.toString()).toSolidityAddress();

	// console.log('\n----- Minting NFT -----');
	// console.log('Initiating NFT minting...');
	// const mintToken = new ContractExecuteTransaction()
	//     .setContractId(contractId)
	//     .setGas(1000000)
	//     .setMaxTransactionFee(new Hbar(20)) // Use when HBAR is under 10 cents
	//     .setFunction(
	//         "mintNftForUser", // Changed function name to match new contract
	//         new ContractFunctionParameters()
	//             .addAddress(tokenIdSolidityAddr) // Token address
	//             .addBytesArray([Buffer.from(metadata)]) // Metadata
	//             .addAddress(allowedClaimerAddress) // Add the wallet address that can claim this NFT
	//     );
	// const mintTokenTx = await mintToken.execute(client);
	// const mintTokenRx = await mintTokenTx.getRecord(client);
	// const serial = mintTokenRx.contractFunctionResult!.getInt64(0);
	// console.log(`NFT Minted successfully!`);
	// console.log(`NFT Details:`);
	// console.log(`   - Serial Number: ${serial}`);
	// console.log(`   - Token ID: ${tokenId}`);
	// console.log(`   - Metadata: ${metadata}`);
	// console.log(`   - Allowed Claimer: ${allowedClaimerAddress}`);
	// console.log(`View NFT: https://hashscan.io/testnet/token/${tokenId}/${serial}`);

	// Summary
	console.log('\n----- Deployment Summary -----')
	console.log(`Contract ID: ${contractId}`)
	console.log(`Token ID: ${tokenId}`)
	console.log(`\nAll operations completed successfully! 🎉\n`)

	return {
		contractId: contractId,
		tokenId: tokenId,
	}
}
