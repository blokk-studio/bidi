<script lang="ts">
	import HashConnectLoader from '$lib/hashconnect/HashConnectLoader.svelte'
	import { LedgerId } from '@hashgraph/sdk'
	import containerStyles from '$lib/css/container.module.css'
	import navigationLinkStyles from '$lib/css/navigationLink.module.css'
	import CreateCertificate from 'lucide-svelte/icons/file-plus'
	import User from 'lucide-svelte/icons/user'
	import Disconnect from 'lucide-svelte/icons/log-out'
	import Testnet from 'lucide-svelte/icons/test-tube-diagonal'

	let { children } = $props()
</script>

<aside class={containerStyles.container}>
	<nav>
		<a
			href="/dashboard/mint"
			class="{navigationLinkStyles.navigationLink} {navigationLinkStyles.withIcon}"
		>
			<CreateCertificate aria-hidden="true" />

			Create certificate
		</a>
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
			<div role="menu" class="userMenu">
				<div
					title="Connected to {hashConnect.session.ledgerId.toString()} with {hashConnect.session.accountId.toString()}"
					class="userDetails"
				>
					<User aria-hidden="true" />

					{hashConnect.session.accountId.toString()}

					{#if hashConnect.session.ledgerId === LedgerId.TESTNET}
						<span aria-hidden="true" title="Connected to testnet" class="testnetIndicator">
							<Testnet />
						</span>
					{/if}
				</div>

				<button onclick={hashConnect.session.disconnect} title="Disconnect">
					<Disconnect aria-label="Disconnect" />
				</button>

				<label>
					Switch chain

					<select bind:value={hashConnect.selectedLedgerId}>
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

	.userMenu {
		display: grid;
		grid-template-columns: repeat(3, auto);
	}

	.userDetails {
		display: grid;
		grid-template-columns: max-content 1fr max-content;
		column-gap: 0.5rem;
		color: var(--colorOrange0);
		font-weight: 600;
	}

	.testnetIndicator {
		color: var(--colorPurple0);
	}
</style>
