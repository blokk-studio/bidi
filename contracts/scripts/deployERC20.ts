import * as fs from "fs";
import * as path from "path";
import {
  AccountId,
  ContractCreateFlow,
  ContractFunctionParameters,
  AccountBalanceQuery,
} from "@hashgraph/sdk";
import { clientSetup } from "./client";

require("dotenv").config();

const collateralTokenId = AccountId.fromString(
  process.env.COLLATERAL_TOKEN_ID!,
);
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
    "../artifacts/contracts/src/ERC20.sol/Bidi.json",
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
    .setGas(1000000)
    .setBytecode(bytecode)
    .setConstructorParameters(
      new ContractFunctionParameters()
        .addAddress(operatorId.toSolidityAddress()) // initialOwner
        .addAddress(collateralTokenId.toSolidityAddress()), // _collateralToken (HCHF?)
    );

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

  // Summary
  console.log("\n----- Deployment Summary -----");
  console.log(`Contract ID: ${contractId}`);
  console.log(`\nAll operations completed successfully! 🎉\n`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
