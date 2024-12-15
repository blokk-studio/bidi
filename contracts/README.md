# Contract is work in progress

## What is covered?
- a simple and clean way to create a NFT via smart contract, in the Hedera way.
- as there is no way to send NFT to user wallets during mint (as it's possible in Eth), we are assigning the target wallet id upon mint. Later on, only the assigned wallet will be able to claim the NFT.

## What's needed?
- create BIDI fungible token and lock a certain amount on the NFT, upon minting. The contract will be re-deployed after that's done.

## Deploy the contract
To deploy the project as it is:
- to clear previous contract generations and artifacts ``pnpm run clear``
- to compile a fresh contract ``pnpm run compile``
- before deploying the contract, we have to make sure we added ``NFT_METADATA_URI`` in env variables as future NFT metadata will be saved under that folder. (https://pinata.cloud/ would be a nice place to start..)
- when everything is ready, run ``pnm run deploy`` and the contract will be deployed, and NFT collection created.

Logs after the deployment:
```html
> ts-node scripts/deploy.ts

Client setup complete.

----- Account Information -----
💰 Account Balance:
   - 198.56787986 ℏ (HBAR)

----- Deployment Configuration -----
Operator Account: 0.0.4425801
Network: Testnet
Metadata URI: ipfs://bafyreie3ichmqul4xa7e6xcy34tylbuq2vf3gnjf7c55trg3b6xyjr4bku/metadata.json
HashScan Explorer: https://hashscan.io/testnet

----- Reading Contract -----
Contract bytecode size: 10689 bytes

----- Deploying Contract -----
Initiating contract deployment...
Contract deployed successfully!
Contract ID: 0.0.5266745
View Contract: https://hashscan.io/testnet/contract/0.0.5266745

----- Creating NFT Collection -----
Initiating NFT collection creation...
NFT Collection created successfully!
Collection Details:
   - Token ID: 0.0.5266746
   - Name: Fall Collection
   - Symbol: LEAF
   - Max Supply: 250
View Token: https://hashscan.io/testnet/token/0.0.5266746

----- Minting NFT -----
Initiating NFT minting...
NFT Minted successfully!
NFT Details:
   - Serial Number: 1
   - Token ID: 0.0.5266746
   - Metadata: ipfs://bafyreie3ichmqul4xa7e6xcy34tylbuq2vf3gnjf7c55trg3b6xyjr4bku/metadata.json
   - Allowed Claimer: 000000000000000000000000000000000001e240
View NFT: https://hashscan.io/testnet/token/0.0.5266746/1

----- Deployment Summary -----
Contract ID: 0.0.5266745
Token ID: 0.0.5266746
NFT Serial: 1

```

### Claim logs:

on successful claim:
```html
----- Claiming NFT -----
Initiating claim for NFT #1
NFT claimed successfully!
Claim Details:
   - Token ID: 0.0.5266928
   - Serial Number: 1
   - New Owner: 0.0.4425801
View NFT: https://hashscan.io/testnet/token/0.0.5266928/1

```

if trying to claim a NFT assigned to another wallet
```html
----- Claiming NFT -----
Initiating claim for NFT #1
Error claiming NFT: receipt for transaction 0.0.4425801@1734219979.978556893 contained error status CONTRACT_REVERT_EXECUTED

```