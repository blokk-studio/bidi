import {
  AccountId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  Hbar,
} from "@hashgraph/sdk";
import { clientSetup } from "../../helpers/client";

// Get command line arguments
const [contractId, minterId] = process.argv.slice(2);

if (!contractId || !minterId) {
  console.error("Missing required arguments");
  console.error("Usage: npx ts-node addMinter.ts <contractId> <minterId>");
  console.error("Example: npx ts-node addMinter.ts 0.0.123456 0.0.789101");
  process.exit(1);
}

const addMinter = async () => {
  try {
    // Create client and set operator
    const client = clientSetup();

    console.log("\n----- Adding New Minter -----");
    console.log(`Contract ID: ${contractId}`);
    console.log(`Minter ID: ${minterId}`);

    // Convert IDs to correct format
    const contractIdObj = ContractId.fromString(contractId);
    const minterIdObj = AccountId.fromString(minterId);
    const minterAddress = minterIdObj.toSolidityAddress();

    // Create and execute the transaction
    const addMinterTx = new ContractExecuteTransaction()
      .setContractId(contractIdObj)
      .setGas(1000000)
      .setMaxTransactionFee(new Hbar(20))
      .setFunction(
        "addMinter",
        new ContractFunctionParameters().addAddress(minterAddress),
      );

    const txResponse = await addMinterTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log("\nMinter added successfully!");
    console.log("Transaction ID:", txResponse.transactionId.toString());

    client.close();
  } catch (error) {
    console.error("Error adding minter:", error);
    throw error;
  }
};

addMinter();
