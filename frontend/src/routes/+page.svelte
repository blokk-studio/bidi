<script lang="ts">
	import NftTile from '$lib/components/NftTile.svelte'

	let { data } = $props()
</script>

<main>
	<div class="grain"></div>

	<div class="content-wrapper">
		<div class="cards-grid">
			{#if !data.nfts.length}
				<p>No NFTs have been minted yet.</p>
			{:else}
				{#each data.nfts as nft}
					<a href="/certificates/{nft.serialNumber}" class="certificateLink">
						<NftTile {...nft} />
					</a>
				{/each}
			{/if}
		</div>
	</div>
</main>

<style>
	.content-wrapper {
		display: grid;
		position: relative;
		gap: 64px;
		z-index: 2;
		padding: 5rem 3rem 3rem 3rem;
	}

	@media (min-width: 1024px) {
		.content-wrapper {
			margin-right: 32px;
		}
	}

	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		align-items: start;
		gap: 2rem;
	}

	.certificateLink {
		display: block;
		transition-duration: 200ms;
		transition-property: scale;
		transition-timing-function: ease-out;
		color: inherit;
		text-decoration: none;

		@media (hover: hover) {
			&:hover {
				scale: 1.03;
			}
		}
	}
</style>
