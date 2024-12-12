<script lang="ts">
	import { LedgerId } from '@hashgraph/sdk'
	import HashConnectLoader from './HashConnectLoader.svelte'

	let { children } = $props()
</script>

<HashConnectLoader>
	{#snippet children({ hashConnect })}
		{#if hashConnect.session}
			Connected to {hashConnect.session.ledgerId.toString()} with {hashConnect.session.accountId.toString()}

			{#if hashConnect.session}
				<button onclick={hashConnect.session.disconnect}>disconnect</button>
			{/if}
		{:else}
			<button
				onclick={() => {
					hashConnect.connect()
				}}
			>
				Connect HashPack
			</button>
		{/if}

		<select bind:value={hashConnect.ledgerId}>
			<option value={LedgerId.TESTNET}>{LedgerId.TESTNET}</option>
			<option value={LedgerId.MAINNET}>{LedgerId.MAINNET}</option>
		</select>
	{/snippet}
</HashConnectLoader>

{@render children()}
