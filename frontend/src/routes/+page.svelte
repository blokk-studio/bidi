<script lang="ts">
	import NftTile from '$lib/components/NftTile.svelte'
	import containerStyles from '$lib/css/container.module.css'

	let { data } = $props()
</script>

<main class={containerStyles.container}>
	<h1>Missions</h1>

	{#if !data.nfts.length}
		<p>No NFTs have been minted yet.</p>
	{:else}
		<ul class="cards-grid">
			{#each data.nfts as nft}
				<li>
					<a href="/certificates/{nft.serialNumber}" class="certificateLink">
						<NftTile {...nft} />
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style>
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
