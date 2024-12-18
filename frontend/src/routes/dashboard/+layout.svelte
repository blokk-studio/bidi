<script lang="ts">
	import HashConnectLoader from '$lib/hashconnect/HashConnectLoader.svelte'
	import { LedgerId } from '@hashgraph/sdk'

	let { children } = $props()
</script>

<aside>
	<nav>
		<a href="/dashboard/mint">Create certificate</a>
	</nav>

	<HashConnectLoader>
		{#snippet initialized({ hashConnect })}
			<div>
				<select bind:value={hashConnect.selectedLedgerId}>
					<option value={LedgerId.TESTNET}>{LedgerId.TESTNET}</option>
					<option value={LedgerId.MAINNET}>{LedgerId.MAINNET}</option>
				</select>

				<button onclick={hashConnect.connect}>
					Connect to {hashConnect.selectedLedgerId}
				</button>
			</div>
		{/snippet}
		{#snippet paired({ hashConnect })}
			<div>
				Connected to {hashConnect.session.ledgerId.toString()} with {hashConnect.session.accountId.toString()}

				<button onclick={hashConnect.session.disconnect}>disconnect</button>

				<label>
					switch chain <select bind:value={hashConnect.selectedLedgerId}>
						<option value={LedgerId.TESTNET}>{LedgerId.TESTNET}</option>
						<option value={LedgerId.MAINNET}>{LedgerId.MAINNET}</option>
					</select>
				</label>
			</div>
		{/snippet}
	</HashConnectLoader>
</aside>

{@render children()}

<style>
	aside {
		display: grid;
		grid-template-columns: 1fr auto;
	}

	nav {
		margin-inline: max(1rem, 50% - 20rem);
	}

	a {
		display: inline-block;
		padding-inline: 0.25rem;
	}
</style>
