<script lang="ts">
	import containerStyles from '$lib/css/container.module.css'
	import navigationLinkStyles from '$lib/css/navigationLink.module.css'
	import { contractId, nftTokenId } from '$lib/deployment.js'
	import HashConnectLoader from '$lib/hashconnect/HashConnectLoader.svelte'
	import { associateWithToken } from '$lib/hedera/collection/associate'
	import { claimNftWithExecutor } from '$lib/hedera/collection/claim.js'
	import Claim from 'lucide-svelte/icons/file-down'
	import Associate from 'lucide-svelte/icons/handshake'

	let { data } = $props()
</script>

<main class={containerStyles.container}>
	<h1>
		<span class="serialNumber">#{data.nft.serialNumber}</span>
		{data.nft.name}
	</h1>

	{#if !data.nft.isClaimed}
		<HashConnectLoader>
			{#snippet withAccountInformation({ hashConnect })}
				{#if data.nft.claimerAccountId.toString() === hashConnect.session.accountId.toString()}
					{#if hashConnect.accountInformation.hasAssociatedWithToken}
						<button
							onclick={() => {
								claimNftWithExecutor({
									contractId: contractId,
									tokenId: nftTokenId,
									serialNumber: data.nft.serialNumber,
									executeTransaction: hashConnect.session.executeTransaction,
								})
							}}
							class="{navigationLinkStyles.navigationLink} {navigationLinkStyles.withIconRight}"
						>
							Claim this NFT

							<Claim aria-hidden="true" />
						</button>
					{:else}
						<button
							onclick={async () => {
								const associateWithTokenResult = await associateWithToken({
									accountId: hashConnect.session.accountId,
									tokenId: nftTokenId,
									executeTransaction: hashConnect.session.executeTransaction,
								})

								hashConnect.accountInformation.hasAssociatedWithToken =
									associateWithTokenResult.hasAssociatedWithToken
							}}
							class="{navigationLinkStyles.navigationLink} {navigationLinkStyles.withIconRight}"
						>
							Associate with BIDI

							<Associate aria-hidden="true" />
						</button>
					{/if}
				{/if}
			{/snippet}
		</HashConnectLoader>
	{/if}

	<img src={data.nft.imageUrl} alt="Image of certificate #{data.nft.serialNumber}" />
</main>

<style>
	img {
		margin-top: 1rem;
	}

	.serialNumber {
		margin-right: 0.75rem;
		font-family: 'Andale Mono', monospace;
	}
</style>
