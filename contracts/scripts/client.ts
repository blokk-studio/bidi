// https://docs.hedera.com/hedera/getting-started/environment-set-up

import { Client, Hbar, PrivateKey } from '@hashgraph/sdk'
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

    let privateKey: PrivateKey | undefined = undefined;
    if (process.env.HEDERA_PRIVATE_KEY_TYPE === "ecdsa") {
        console.info("Private key was declared to be ECDSA");
        privateKey = PrivateKey.fromStringECDSA(myPrivateKey);
    } else {
        if (process.env.HEDERA_PRIVATE_KEY_TYPE === "ed25519") {
        console.info("Private key was declared to be ED25519");
        } else {
        console.warn(
            "Private key is assumed to be ed25519 because HEDERA_PRIVATE_KEY_TYPE is not set correctly or at all.",
            { HEDERA_PRIVATE_KEY_TYPE: process.env.HEDERA_PRIVATE_KEY_TYPE }
        );
        }

        privateKey = PrivateKey.fromStringED25519(myPrivateKey);
    }

    // Set your account as the client's operator
    client.setOperator(myAccountId, privateKey);

    // Set the default maximum transaction fee (in Hbar)
    client.setDefaultMaxTransactionFee(new Hbar(100))

    // Set the maximum payment for queries (in Hbar)
    client.setDefaultMaxQueryPayment(new Hbar(50))

    console.log('Client setup complete.')

    return client
}