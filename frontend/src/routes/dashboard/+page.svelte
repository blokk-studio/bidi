<script lang="ts">
	import NftTile from '$lib/components/NftTile.svelte'
	import { nftTokenId } from '$lib/deployment'
	import HashConnectLoader from '$lib/hashconnect/HashConnectLoader.svelte'
	import { getNfts } from '$lib/hedera/getNfts'
	import containerStyles from '$lib/css/container.module.css'
</script>

<main class={containerStyles.container}>
	<h1>BIDI Dashboard</h1>

	<h2>Your certificates</h2>

	<HashConnectLoader>
		{#snippet paired({ hashConnect })}
			{#await getNfts( { ledgerId: hashConnect.session.ledgerId, tokenId: nftTokenId, accountId: hashConnect.session.accountId }, )}
				<p>Loading your certificates...</p>
			{:then nfts}
				{#if !nfts.length}
					<p>You don't have any certificates.</p>
				{:else}
					<ul>
						{#each nfts as nft}
							<li>
								<NftTile {...nft} />
							</li>
						{/each}
					</ul>
				{/if}
			{/await}
		{/snippet}
	</HashConnectLoader>
</main>
