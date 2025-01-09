import { LedgerId } from '@hashgraph/sdk'
import type { Client, Params } from '@tikz/hedera-mirror-node-ts'
import { getMirrorNodeUrl } from './mirrorNode/getMirrorNodeUrl'

/**
 * a mirror node client using a provided fetch function instead of the global
 */
export class MirrorNodeClient implements Client {
	readonly #fetch: typeof globalThis.fetch
	readonly #mirrorNodeBaseUrl: string

	/**
	 * creates a new mirror node client based on the provided ledger id
	 *
	 * falls back onto the global fetch if one is not provided.
	 */
	static newFromLedgerId(ledgerId: LedgerId, options?: { fetch?: typeof globalThis.fetch }) {
		const mirrorNodeBaseUrl = getMirrorNodeUrl(ledgerId)
		const fetch_ = options?.fetch ?? fetch

		return new MirrorNodeClient({ mirrorNodeBaseUrl, fetch: fetch_ })
	}

	// private constructor to be used by static factory functions to keep a clean interface
	private constructor(options: { fetch: typeof globalThis.fetch; mirrorNodeBaseUrl: string }) {
		this.#fetch = options.fetch
		this.#mirrorNodeBaseUrl = options.mirrorNodeBaseUrl
	}

	// client properties
	async fetch<D>(url: string, params: Params): Promise<D> {
		const urlSearchParams = new URLSearchParams(params)
		const urlWithSearchParams = `${url}?${urlSearchParams.toString()}`
		const mirrorNodeUrl = new URL(urlWithSearchParams, this.#mirrorNodeBaseUrl)
		const response = await this.#fetch(mirrorNodeUrl)
		const data: D = await response.json()

		return data
	}
	get baseURL() {
		return this.#mirrorNodeBaseUrl
	}
}
