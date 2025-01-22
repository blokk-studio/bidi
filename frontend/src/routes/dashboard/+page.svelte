<script lang="ts">
	import { nftTokenId } from '$lib/deployment'
	import HashConnectLoader from '$lib/hashconnect/HashConnectLoader.svelte'
	import { getNfts } from '$lib/hedera/getNfts'
	import containerStyles from '$lib/css/container.module.css'
	import navigationLinkStyles from '$lib/css/navigationLink.module.css'
</script>

<main class={containerStyles.container}>
	<h1>BIDI Dashboard</h1>

	<h2>Claimed certificates</h2>

	<HashConnectLoader>
		{#snippet paired({ hashConnect })}
			{#await getNfts( { ledgerId: hashConnect.session.ledgerId, tokenId: nftTokenId, accountId: hashConnect.session.accountId }, )}
				<p>Loading your certificates...</p>
			{:then nfts}
				{#if !nfts.length}
					<p>You don't have any certificates.</p>
				{:else}
					<div role="presentation" class="nftListContainer">
						<ul class="nftList">
							{#each nfts as nft}
								<li>
									<a
										href="/certificates/{nft.serialNumber}"
										class={navigationLinkStyles.navigationLink}
									>
										<figure class="nftListItem">
											<img
												src={nft.imageUrl}
												alt="Image of certificate {nft.name}"
												class="nftTile"
											/>

											<div role="presentation">
												<span class="nftSerialNumber">#{nft.serialNumber}</span>

												{nft.name}
											</div>
										</figure>
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			{/await}
		{/snippet}
	</HashConnectLoader>
</main>

<style>
	.nftListContainer {
		container-name: nfts;
		container-type: inline-size;
	}

	.nftList {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		@container nfts (min-width: 20rem) {
			grid-template-columns: repeat(2, 1fr);
		}
		@container nfts (min-width: 40rem) {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.nftListItem {
		display: grid;
		gap: 0.5rem;
	}

	.nftSerialNumber {
		margin-right: 0.75rem;
		font-family: 'Andale Mono', monospace;
	}
</style>
