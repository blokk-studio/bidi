// https://docs.hedera.com/hedera/getting-started/environment-set-up

import { Client, Hbar } from '@hashgraph/sdk'
import {config} from "dotenv";

config();

export const clientSetup = () => {
    // Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.HEDERA_ACCOUNT_ID
    const myPrivateKey = process.env.HEDERA_PRIVATE_KEY
    const environment = process.env.HEDERA_ENVIRONMENT

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error('Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present')
    }

    // Create your Hedera Testnet/Mainnet client
    let client
    if (environment === 'testnet') {
        client = Client.forTestnet()
    } else {
        client = Client.forMainnet()
    }

    // Set your account as the client's operator
    client.setOperator(myAccountId, myPrivateKey)

    // Set the default maximum transaction fee (in Hbar)
    client.setDefaultMaxTransactionFee(new Hbar(100))

    // Set the maximum payment for queries (in Hbar)
    client.setDefaultMaxQueryPayment(new Hbar(50))

    console.log('Client setup complete.')

    return client
}