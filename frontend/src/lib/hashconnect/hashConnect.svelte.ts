import { dev } from '$app/environment'
import { PUBLIC_HASHCONNECT_PROJECT_ID } from '$env/static/public'
import type { Execute } from '$lib/hedera/Execute'
import { AccountId, LedgerId } from '@hashgraph/sdk'
import { untrack } from 'svelte'
import { HashConnect, type SessionData } from 'virtual:hashconnect'
import { dappMetadata } from './dappMetadata'

/** an accurate type to reflect account id strings */
type AccountIdString = `${number}.${number}.${number}`
/** an accurate type union to reflect the possible network names */
type NetworkName = 'testnet' | 'mainnet'
/**
 * a custom representation of session data in a format most useful to us
 *
 * the property names are intentionally different to distinguish them from @hashgraph/sdk exports such as AccountId & LedgerId.
 *
 * the string properties might be replaced by @hashgraph/sdk's AccountId & LedgerId later on.
 */
interface ReactiveHashConnectSession {
	/** the user's account id in its string representation */
	accountIdString: AccountIdString
	accountId: AccountId
	/** the name of the chain we're currently sending transactions to */
	networkName: NetworkName
	disconnect: () => void
	execute: Execute
}

/**
 * a custom interface to hashconnect with reactive state that exposes only the things we need
 */
export interface ReactiveHashConnect {
	/**
	 * the current hashconnect session, if paired
	 *
	 * is `undefined` if not paired or no account id is available in the hashconnect session
	 */
	readonly session?: ReactiveHashConnectSession
	/**
	 * the ledger id setting reflecting the chain the user would like to use
	 *
	 * does not reflect the current connection/session unlike {@link ReactiveHashConnectSession.networkName}.
	 */
	ledgerId: LedgerId
	connect: () => void
}

const getSession = (options: {
	hashConnectInstance: HashConnect
	sessionData: SessionData
}): ReactiveHashConnectSession | undefined => {
	const firstAccountIdString = options.sessionData.accountIds[0]
	if (!firstAccountIdString) {
		return
	}

	const networkName = options.sessionData.network
	const accountId = AccountId.fromString(firstAccountIdString)
	const disconnect = options.hashConnectInstance.disconnect.bind(hashConnectInstance)
	const execute: Execute = (query) => {
		const signer = options.hashConnectInstance.getSigner(
			accountId as unknown as Parameters<HashConnect['getSigner']>[0],
		)

		return query.executeWithSigner(
			signer as unknown as Parameters<(typeof query)['executeWithSigner']>[0],
		)
	}

	// plain string values for now, but might be replaced by AccountId & LedgerId
	return {
		accountIdString: firstAccountIdString as AccountIdString,
		networkName: networkName as NetworkName,
		accountId,
		disconnect,
		execute,
	}
}

let ledgerId = $state(LedgerId.TESTNET)
let hashConnectInstance = $state<HashConnect>()
let hasHashConnectInstanceInitialized = $state(false)
let sessionData = $state<SessionData>()
const hashConnect = $derived.by((): ReactiveHashConnect | undefined => {
	if (!hashConnectInstance || !hasHashConnectInstanceInitialized) {
		return
	}

	const connect = hashConnectInstance.openPairingModal.bind(hashConnectInstance)
	const session = $derived(sessionData && getSession({ sessionData, hashConnectInstance }))

	return {
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
})

// re-create the hashconnect instance whenever the ledger id changes
$effect.root(() => {
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
})

// create a function to subscribe to hashconnect events whenever it's used in a reactive context
// based on https://www.matsimon.dev/blog/svelte-in-depth-effect-tracking
let numberOfSubscribers = 0
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
let stopSubscribing: (() => void) | null = null
export const useHashConnect = () => {
	if ($effect.tracking()) {
		// this will also re-run whenever the hashconnect instance state changes
		$effect(() => {
			// don't do anything if there is no instance yet
			if (!hashConnectInstance) {
				return
			}

			if (numberOfSubscribers === 0) {
				stopSubscribing = startSubscribing(hashConnectInstance)
			}

			numberOfSubscribers++

			// when the effect is destroyed
			const destroy = () => {
				numberOfSubscribers--

				// the last effect that is destroyed must also remove all event listeners
				if (numberOfSubscribers === 0) {
					stopSubscribing?.()
					stopSubscribing = null
				}
			}

			return destroy
		})
	}

	return hashConnect
}
