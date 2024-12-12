<script lang="ts">
	import { LedgerId } from '@hashgraph/sdk'
	import HashConnectLoader from '$lib/hashconnect/HashConnectLoader.svelte'

	let { children } = $props()
</script>

<HashConnectLoader>
	{#snippet initialized({ hashConnect })}
		<select bind:value={hashConnect.selectedLedgerId}>
			<option value={LedgerId.TESTNET}>{LedgerId.TESTNET}</option>
			<option value={LedgerId.MAINNET}>{LedgerId.MAINNET}</option>
		</select>

		<button onclick={hashConnect.connect}>
			Connect to {hashConnect.selectedLedgerId}
		</button>
	{/snippet}

	{#snippet paired({ hashConnect })}
		Connected to {hashConnect.session.ledgerId.toString()} with {hashConnect.session.accountId.toString()}

		<button onclick={hashConnect.session.disconnect}>disconnect</button>

		<label>
			switch chain
			<select bind:value={hashConnect.selectedLedgerId}>
				<option value={LedgerId.TESTNET}>{LedgerId.TESTNET}</option>
				<option value={LedgerId.MAINNET}>{LedgerId.MAINNET}</option>
			</select>
		</label>
	{/snippet}
</HashConnectLoader>

{@render children()}
