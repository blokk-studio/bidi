<script lang="ts">
	import NftTile from './NftTile.svelte'

	let { data } = $props()
</script>

<h1>BIDI</h1>

<h2>NFTs</h2>

{#if !data.nfts.length}
	<p>No NFTs have been minted yet.</p>
{:else}
	<ul class="nfts">
		{#each data.nfts as nft}
			<li>
				<NftTile {...nft} />
			</li>
		{/each}
	</ul>
{/if}

<style>
	.nfts {
		display: grid;
		grid-template-columns: repeat(auto-fill, 16rem);
		gap: 1rem;
		padding-left: 0;
		list-style-type: none;
	}
</style>
