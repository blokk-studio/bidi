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
					<NftTile {...nft} />
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

	.grain {
		position: fixed;
		top: 0;
		left: 0;
		transform: translateZ(0);
		z-index: 0;
		width: 100%;
		height: 100%;
	}

	.grain:before {
		position: fixed;
		top: -10rem;
		left: -10rem;
		opacity: 0.1;
		z-index: 9999;
		animation: noise 1s steps(2) infinite;
		background-image: url(https://upload.wikimedia.org/wikipedia/commons/5/5c/Image_gaussian_noise_example.png);
		width: calc(100% + 20rem);
		height: calc(100% + 20rem);
		pointer-events: none;
		content: '';
	}

	@keyframes noise {
		0% {
			transform: translate3d(0, 9rem, 0);
		}
		10% {
			transform: translate3d(-1rem, -4rem, 0);
		}
		20% {
			transform: translate3d(-8rem, 2rem, 0);
		}
		30% {
			transform: translate3d(9rem, -9rem, 0);
		}
		40% {
			transform: translate3d(-2rem, 7rem, 0);
		}
		50% {
			transform: translate3d(-9rem, -4rem, 0);
		}
		60% {
			transform: translate3d(2rem, 6rem, 0);
		}
		70% {
			transform: translate3d(7rem, -8rem, 0);
		}
		80% {
			transform: translate3d(-9rem, 1rem, 0);
		}
		90% {
			transform: translate3d(6rem, -5rem, 0);
		}
		100% {
			transform: translate3d(-7rem, 0, 0);
		}
	}
</style>
