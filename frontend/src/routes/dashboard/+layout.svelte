<script lang="ts">
	import HashConnectLoader from '$lib/hashconnect/HashConnectLoader.svelte'
	import { LedgerId } from '@hashgraph/sdk'
	import containerStyles from '$lib/css/container.module.css'
	import navigationLinkStyles from '$lib/css/navigationLink.module.css'
	import CreateCertificate from 'lucide-svelte/icons/file-plus'
	import User from 'lucide-svelte/icons/user'
	import Connect from 'lucide-svelte/icons/plug'
	import Testnet from 'lucide-svelte/icons/test-tube-diagonal'
	import UserMenu from '$lib/components/UserMenu.svelte'

	let { children } = $props()
</script>

<aside class={containerStyles.container}>
	<HashConnectLoader>
		{#snippet withAccountInformation({ hashConnect })}
			{#if hashConnect.accountInformation.canMint}
				<nav>
					<a
						href="/dashboard/mint"
						class="{navigationLinkStyles.navigationLink} {navigationLinkStyles.withIconRight}"
					>
						Create certificate

						<CreateCertificate aria-hidden="true" />
					</a>
				</nav>
			{/if}
		{/snippet}
	</HashConnectLoader>

	<HashConnectLoader>
		{#snippet initialized({ hashConnect })}
			<div role="menu" class="connectionMenu">
				<select bind:value={hashConnect.selectedLedgerId}>
					<option value={LedgerId.TESTNET} selected>{LedgerId.TESTNET}</option>
					<option value={LedgerId.MAINNET} disabled>{LedgerId.MAINNET}</option>
				</select>

				<button
					onclick={hashConnect.connect}
					class="{navigationLinkStyles.navigationLink} {navigationLinkStyles.withIconRight}"
				>
					Connect

					<Connect aria-hidden="true" />
				</button>
			</div>
		{/snippet}
		{#snippet paired({ hashConnect })}
			<div class="userMenu">
				<div
					title="Connected to {hashConnect.session.ledgerId.toString()} with {hashConnect.session.accountId.toString()}"
					class="userDetails"
				>
					<User aria-hidden="true" />

					<span class="userAccountId">
						{hashConnect.session.accountId.toString()}
					</span>

					{#if hashConnect.session.ledgerId === LedgerId.TESTNET}
						<span aria-hidden="true" title="Connected to testnet" class="testnetIndicator">
							<Testnet />
						</span>
					{/if}
				</div>

				<UserMenu
					bind:ledgerId={hashConnect.selectedLedgerId}
					disconnect={hashConnect.session.disconnect}
				/>
			</div>
		{/snippet}
	</HashConnectLoader>
</aside>

{@render children()}

<style>
	aside {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
	}

	.connectionMenu {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 1rem;
	}

	.userMenu {
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		margin-right: -0.75rem;
	}

	.userDetails {
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		color: var(--colorGreen0);
		font-weight: 600;
	}

	.userAccountId {
		margin-left: 0.25rem;
	}

	.testnetIndicator {
		margin-left: 0.75rem;
		color: var(--colorPurple0);
	}
</style>
