import { dev } from '$app/environment'
import { PUBLIC_HASHCONNECT_PROJECT_ID } from '$env/static/public'
import type { ExecuteTransaction } from '$lib/hedera/Execute'
import { AccountId, LedgerId } from '@hashgraph/sdk'
import { untrack } from 'svelte'
import { HashConnect, type SessionData } from 'virtual:hashconnect'
import { dappMetadata } from './dappMetadata'

/**
 * a custom representation of session data in a format most useful to us
 */
interface ReactiveHashConnectSession {
	/** the id of the account that's currently connected */
	accountId: AccountId
	/** the id of the chain that the account is currently connected to */
	ledgerId: LedgerId
	/** disconnects the dapp from the wallet and removes the session data */
	disconnect: () => void
	/** executes any transaction from @hashgraph/sdk with the wallet */
	executeTransaction: ExecuteTransaction
}

/**
 * a custom interface to hashconnect with reactive state that exposes only the things we need
 */
export interface ReactiveHashConnect {
	/**
	 * the ledger id setting reflecting the chain the user would like to use
	 *
	 * does not reflect the current connection/session unlike {@link ReactiveHashConnectSession['ledgerId']}.
	 */
	ledgerId: LedgerId
	/**
	 * the current hashconnect session, if paired
	 *
	 * is `undefined` if not paired or no account id is available in the hashconnect session
	 */
	readonly session?: ReactiveHashConnectSession
	/**
	 * the function to connect to the wallet
	 *
	 * hashconnect is initialized and ready to pair if this function is defined.
	 *
	 * is `undefined` while initializing.
	 */
	readonly connect?: () => void
}

const getSession = (options: {
	hashConnectInstance: HashConnect
	sessionData: SessionData
}): ReactiveHashConnectSession | undefined => {
	const firstAccountIdString = options.sessionData.accountIds[0]
	if (!firstAccountIdString) {
		return
	}

	const ledgerId = LedgerId.fromString(options.sessionData.network)
	const accountId = AccountId.fromString(firstAccountIdString)
	const disconnect = options.hashConnectInstance.disconnect.bind(hashConnectInstance)
	const executeTransaction: ExecuteTransaction = async (transaction) => {
		// there are irrelevant inconsistencies between the internal properties of the types from different versions of @hashgraph/sdk
		const transactionReceipt = await options.hashConnectInstance.sendTransaction(
			accountId as unknown as Parameters<HashConnect['sendTransaction']>[0],
			transaction as unknown as Parameters<HashConnect['sendTransaction']>[1],
		)

		return transactionReceipt as unknown as ReturnType<ExecuteTransaction>
	}

	return {
		accountId,
		ledgerId,
		disconnect,
		executeTransaction,
	}
}

let ledgerId = $state(LedgerId.TESTNET)
let hashConnectInstance = $state<HashConnect>()
let hasHashConnectInstanceInitialized = $state(false)
let sessionData = $state<SessionData>()
const session = $derived.by(() => {
	if (!hashConnectInstance || !hasHashConnectInstanceInitialized) {
		return
	}

	if (!sessionData) {
		return
	}

	return getSession({ sessionData, hashConnectInstance })
})
const connect = $derived.by(() => {
	if (!hashConnectInstance || !hasHashConnectInstanceInitialized) {
		return
	}

	const connect = hashConnectInstance.openPairingModal.bind(hashConnectInstance)

	return connect
})

const startSubscribing = (hashConnectInstance: HashConnect) => {
	// set up event subscribers
	const updateSessionData = (newSessionData: SessionData) => {
		sessionData = newSessionData
	}
	const unsetSessionData = () => {
		sessionData = undefined
	}

	hashConnectInstance.pairingEvent.on(updateSessionData)
	hashConnectInstance.disconnectionEvent.on(unsetSessionData)

	return () => {
		hashConnectInstance.pairingEvent.off(updateSessionData)
		hashConnectInstance.disconnectionEvent.off(unsetSessionData)
	}
}

$effect.root(() => {
	// recreate the hashconnect instance whenever the ledger id changes
	$effect(() => {
		// access the value to trigger reactivity
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		ledgerId

		// only re-run this when the ledger id changes (infinite loop)
		untrack(() => {
			sessionData = undefined
			hasHashConnectInstanceInitialized = false

			hashConnectInstance = new HashConnect(
				ledgerId,
				PUBLIC_HASHCONNECT_PROJECT_ID,
				dappMetadata,
				// debug during development
				dev,
			)
			// start the initialization
			hashConnectInstance.init().then(() => {
				hasHashConnectInstanceInitialized = true
			})
		})
	})

	// subscribe whenever the hashconnect instance changes
	$effect(() => {
		// don't do anything if there is no instance
		if (!hashConnectInstance) {
			return
		}

		const stopSubscribing = startSubscribing(hashConnectInstance)

		// when the effect is destroyed
		const destroy = () => {
			stopSubscribing()
		}

		return destroy
	})
})

export const hashConnect = {
	// ledger id is read-write
	get ledgerId() {
		return ledgerId
	},
	set ledgerId(newLedgerId) {
		ledgerId = newLedgerId
	},
	// readonly pairing initialization method
	get connect() {
		return connect
	},
	// readonly session
	get session() {
		return session
	},
}
