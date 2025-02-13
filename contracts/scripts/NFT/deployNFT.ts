import * as fs from "fs";
import * as path from "path";
import {
  AccountId,
  ContractCreateFlow,
  ContractExecuteTransaction,
  AccountBalanceQuery,
} from "@hashgraph/sdk";
import { clientSetup } from "../helpers/client";

require("dotenv").config();

const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!);

const client = clientSetup();

const main = async () => {
  // Check account balance
  console.log("\n----- Account Information -----");
  const accountBalance = await new AccountBalanceQuery()
    .setAccountId(operatorId)
    .execute(client);

  console.log(`💰 Account Balance:`);
  console.log(`   - ${accountBalance.hbars.toString()} (HBAR)`);

  // Deploy configuration
  console.log("\n----- Deployment Configuration -----");
  console.log(`Operator Account: ${operatorId}`);
  console.log(`Network: Testnet`);
  console.log(`HashScan Explorer: https://hashscan.io/testnet`);

  // Read Contract
  console.log("\n----- Reading Contract -----");
  const artifactPath = path.join(
    __dirname,
    "../../artifacts/contracts/NFTContract.sol/NFTContract.json",
  );
  const contractJson = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const bytecode = contractJson.bytecode.startsWith("0x")
    ? contractJson.bytecode.slice(2)
    : contractJson.bytecode;
  console.log(`Contract bytecode size: ${bytecode.length / 2} bytes`);

  // Deploy Contract
  console.log("\n----- Deploying Contract -----");
  console.log("Initiating contract deployment...");
  const createContract = new ContractCreateFlow()
    .setGas(4000000) // Increase if revert
    .setBytecode(bytecode); // Contract bytecode
  const createContractTx = await createContract.execute(client);
  const createContractRx = await createContractTx.getReceipt(client);
  const contractId = createContractRx.contractId;
  console.log(`Contract deployed successfully!`);
  console.log(`Contract ID: ${contractId}`);
  console.log(
    `View Contract: https://hashscan.io/testnet/contract/${contractId}`,
  );

  if (!contractId) {
    throw new Error("No contract was created");
  }

  // Create NFT Collection
  console.log("\n----- Creating NFT Collection -----");
  console.log("Initiating NFT collection creation...");
  const createToken = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(1000000)
    .setPayableAmount(10)
    .setFunction("createNft");
  const createTokenTx = await createToken.execute(client);
  const createTokenRx = await createTokenTx.getRecord(client);
  const tokenIdSolidityAddr =
    createTokenRx.contractFunctionResult!.getAddress(0);
  const tokenId = AccountId.fromSolidityAddress(tokenIdSolidityAddr);
  console.log(`NFT Collection created successfully!`);
  console.log(`Collection Details:`);
  console.log(`   - Token ID: ${tokenId}`);
  console.log(`View Token: https://hashscan.io/testnet/token/${tokenId}`);

  // Summary
  console.log("\n----- Deployment Summary -----");
  console.log(`Contract ID: ${contractId}`);
  console.log(`Token ID: ${tokenId}`);
  console.log(`\nAll operations completed successfully! 🎉\n`);
};

main();
