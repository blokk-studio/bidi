<script lang="ts">
	import type { Nft } from '$lib/nft'
	let { serialNumber, name, imageUrl }: Pick<Nft, 'imageUrl' | 'name' | 'serialNumber'> = $props()
</script>

<div class="nftTile">
	<span class="serialNumber">#{serialNumber}</span>
	<span class="name">{name}</span>
	<img src={imageUrl} alt="NFT image of {name}" class="image" />
</div>

<style>
	.nftTile {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-areas:
			'image image'
			'serial name';
		column-gap: 1rem;
		row-gap: 0.75rem;
	}

	.serialNumber {
		grid-area: serial;
	}

	.name {
		grid-area: name;
	}

	.image {
		grid-area: image;
		width: 100%;
	}
</style>
