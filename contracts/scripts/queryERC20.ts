import { clientSetup } from "./client";

const { ContractCallQuery, ContractId } = require("@hashgraph/sdk");
require("dotenv").config();

const contractIdArg = process.argv[2];
if (!contractIdArg) {
  console.error("Please provide a contract ID as an argument");
  console.error("Usage: node queryToken.js <contractId>");
  process.exit(1);
}

async function queryTokenDetails(contractIdString: string) {
  const client = clientSetup();
  const contractId = ContractId.fromString(contractIdString);

  try {
    const nameQuery = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction("name");

    const symbolQuery = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction("symbol");

    const totalSupplyQuery = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction("totalSupply");

    const nameResult = await nameQuery.execute(client);
    const symbolResult = await symbolQuery.execute(client);
    const totalSupplyResult = await totalSupplyQuery.execute(client);

    console.log("Token Details:");
    console.log("--------------");
    console.log(`Contract ID: ${contractIdString}`);
    console.log(`Name: ${nameResult.getString(0)}`);
    console.log(`Symbol: ${symbolResult.getString(0)}`);
    console.log(`Total Supply: ${totalSupplyResult.getUint256(0).toString()}`);
  } catch (error) {
    console.error("Error querying token details:", error);
  } finally {
    client.close();
  }
}

queryTokenDetails(contractIdArg);
