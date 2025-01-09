import { dev } from '$app/environment'
import { PUBLIC_HASHCONNECT_PROJECT_ID } from '$env/static/public'
import { contractId, nftTokenId } from '$lib/deployment'
import type { ExecuteTransaction } from '$lib/hedera/Execute'
import { callContract } from '$lib/hedera/mirrorNode/callContract'
import { MirrorNodeClient } from '$lib/hedera/MirrorNodeClient'
import { AccountId, LedgerId, TokenId } from '@hashgraph/sdk'
import { tokenUtils as getTokenUtils } from '@tikz/hedera-mirror-node-ts'
import type { HashConnectSigner } from 'hashconnect/dist/signer'
import { untrack } from 'svelte'
import { HashConnect, type SessionData } from 'virtual:hashconnect'
import { dappMetadata } from './dappMetadata'

/**
 * a custom representation of session data in a format most useful to us
 */
interface ReactiveHashConnectSession {
	/** the id of the chain that the account is currently connected to */
	ledgerId: LedgerId
	/** the id of the account that's currently connected */
	accountId: AccountId
	/** disconnects the dapp from the wallet and removes the session data */
	disconnect: () => void
	/** executes any transaction from @hashgraph/sdk with the wallet */
	executeTransaction: ExecuteTransaction
}

/** extra information about the user's account that is fetched from the mirror node api */
export interface AccountInformation {
	/** whether the user has associated with the nft token */
	hasAssociatedWithToken: boolean
	/** whether the user is allowed to create nfts */
	canMint: boolean
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
	selectedLedgerId: LedgerId
	/**
	 * the current hashconnect session, if paired
	 *
	 * is `undefined` if not paired or no account id is available in the hashconnect session
	 */
	readonly session?: ReactiveHashConnectSession
	/**
	 * information about the account of the current session
	 *
	 * is `undefined` there is no session
	 */
	readonly accountInformation?: AccountInformation
	/**
	 * the function to connect to the wallet
	 *
	 * hashconnect is initialized and ready to pair if this function is defined.
	 *
	 * is `undefined` while initializing.
	 */
	readonly connect?: () => void
}

export type UninitializedReactiveHashConnect = Pick<ReactiveHashConnect, 'selectedLedgerId'>

export type InitializedReactiveHashConnect = Omit<ReactiveHashConnect, 'connect'> &
	Pick<Required<ReactiveHashConnect>, 'connect'>

export type PairedReactiveHashConnect = Omit<ReactiveHashConnect, 'connect' | 'session'> &
	Pick<Required<ReactiveHashConnect>, 'connect' | 'session'>

export type ReactiveHashConnectWithAccountInformation = Omit<
	ReactiveHashConnect,
	'connect' | 'session' | 'accountInformation'
> &
	Pick<Required<ReactiveHashConnect>, 'connect' | 'session' | 'accountInformation'>

export const isInitialized = (
	reactiveHashConnect: ReactiveHashConnect,
): reactiveHashConnect is InitializedReactiveHashConnect => {
	return !!reactiveHashConnect.connect
}

export const isPaired = (
	reactiveHashConnect: ReactiveHashConnect,
): reactiveHashConnect is PairedReactiveHashConnect => {
	return !!reactiveHashConnect.connect && !!reactiveHashConnect.session
}

export const isWithAccountInformation = (
	reactiveHashConnect: ReactiveHashConnect,
): reactiveHashConnect is ReactiveHashConnectWithAccountInformation => {
	return (
		!!reactiveHashConnect.connect &&
		!!reactiveHashConnect.session &&
		!!reactiveHashConnect.accountInformation
	)
}

const getSession = (options: {
	hashConnectInstance: HashConnect
	sessionData: SessionData
}): ReactiveHashConnectSession | undefined => {
	let signer: HashConnectSigner | undefined = undefined
	for (const accountId of options.hashConnectInstance.connectedAccountIds) {
		try {
			signer = options.hashConnectInstance.getSigner(accountId)
			break
		} catch {
			// no session for the current chain
		}
	}
	if (!signer) {
		return
	}

	const ledgerId = signer.getLedgerId()
	const accountId = signer.getAccountId()
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
		ledgerId,
		accountId,
		disconnect,
		executeTransaction,
	}
}
/** stores a ledger id in the browser's local storage */
const saveSelectedLedgerId = (ledgerId: LedgerId) => {
	if (typeof localStorage === 'undefined') {
		console.warn(
			`saveSelectedLedgerId was called when localStorage was not defined. the ledger id ${ledgerId.toString()} will not be saved.`,
		)
		return
	}

	localStorage.setItem('selectedLedgerId', selectedLedgerId.toString())
}
/** reads the ledger id that was stored with {@link saveSelectedLedgerId} from the browser's local storage */
const loadSelectedLedgerId = () => {
	if (typeof localStorage === 'undefined') {
		return LedgerId.MAINNET
	}

	const localStorageItem = localStorage.getItem('selectedLedgerId')
	if (!localStorageItem) {
		return LedgerId.MAINNET
	}

	const selectedLedgerId = LedgerId.fromString(localStorageItem)

	return selectedLedgerId
}

const isMinterFunctionAbi = {
	inputs: [
		{
			internalType: 'address',
			name: 'account',
			type: 'address',
		},
	],
	name: 'isMinter',
	outputs: [
		{
			internalType: 'bool',
			name: '',
			type: 'bool',
		},
	],
	stateMutability: 'view',
	type: 'function',
} as const
export const getAccountInformation = async (options: {
	ledgerId: LedgerId
	accountId: AccountId
	tokenId: TokenId
}): Promise<AccountInformation> => {
	// using global fetch because this only runs client-side
	const client = MirrorNodeClient.newFromLedgerId(options.ledgerId, { fetch })
	const tokenUtils = getTokenUtils(client)
	const tokenIdString = options.tokenId.toString()
	const tokensRequest = tokenUtils.Tokens.setAccountId(options.accountId.toString()).setTokenId(
		tokenIdString,
	)
	const [tokensResponse, isMinterResult] = await Promise.all([
		tokensRequest.get(),
		callContract({
			functionAbi: isMinterFunctionAbi,
			contractId,
			inputs: [options.accountId.toSolidityAddress() as `0x${string}`],
			ledgerId: options.ledgerId,
		}),
	])
	const hasAssociatedWithToken = tokensResponse.tokens.some((token) => {
		return token.token_id === tokenIdString
	})
	const canMint = isMinterResult[0]

	return {
		hasAssociatedWithToken,
		canMint,
	}
}

let selectedLedgerId = $state(loadSelectedLedgerId())
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
let accountInformation = $state<AccountInformation>()

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
		// persist the new ledger id
		saveSelectedLedgerId(selectedLedgerId)

		// only re-run this when the ledger id changes (infinite loop)
		untrack(() => {
			// hashconnect doesn't use the new ledger id for some reason. we need to reload the page if we have an instance already.
			if (hashConnectInstance) {
				window.location.reload()
				return
			}

			sessionData = undefined
			hasHashConnectInstanceInitialized = false

			hashConnectInstance = new HashConnect(
				selectedLedgerId,
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

	$effect(() => {
		if (!session) {
			return
		}

		getAccountInformation({
			accountId: session.accountId,
			ledgerId: session.ledgerId,
			tokenId: nftTokenId,
		}).then((newAccountInformation) => {
			accountInformation = newAccountInformation
		})
	})
})

export const hashConnect: ReactiveHashConnect = {
	// ledger id is read-write
	get selectedLedgerId() {
		return selectedLedgerId
	},
	set selectedLedgerId(newLedgerId) {
		selectedLedgerId = newLedgerId
	},
	// readonly pairing initialization method
	get connect() {
		return connect
	},
	// readonly session
	get session() {
		return session
	},
	get accountInformation() {
		return accountInformation
	},
}
