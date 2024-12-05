<script lang="ts">
	import { LedgerId } from '@hashgraph/sdk'
	import HashConnectLoader from './HashConnectLoader.svelte'

	let { children } = $props()
</script>

<HashConnectLoader>
	{#snippet children({ hashConnect })}
		{#if hashConnect.session}
			Connected to {hashConnect.session.networkName} with {hashConnect.session.accountIdString}

			{#if hashConnect.session}
				<button onclick={hashConnect.disconnect}>disconnect</button>
			{/if}
		{:else}
			<button
				onclick={() => {
					hashConnect.openPairingModal()
				}}
			>
				Connect HashPack
			</button>
		{/if}

		<select
			value={hashConnect.ledgerId}
			oninput={(event) => {
				hashConnect.ledgerId = LedgerId.fromString(event.currentTarget.value)
			}}
		>
			<option value={LedgerId.TESTNET}>{LedgerId.TESTNET}</option>
			<option value={LedgerId.MAINNET}>{LedgerId.MAINNET}</option>
		</select>
	{/snippet}
</HashConnectLoader>

{@render children()}
