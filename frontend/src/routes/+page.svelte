<script lang="ts">
	import NftTile from "$lib/components/NftTile.svelte";

	let { data } = $props()
</script>

<main class="page-container">
	<div class="grain"></div>

	<div class="content-wrapper">
		<div class="cards-grid">
			{#if !data.nfts.length}
				<p>No NFTs have been minted yet.</p>
			{:else}
				{#each data.nfts as nft}
					<NftTile data={nft} />
				{/each}
			{/if}
		</div>

		<div class="sidebar">
			<div class="relative">
				<h2>Create a certificate:</h2>

				<div class="form-group">
					<label for="latitude" class="form-label">Coordinates:</label>
					<div class="coordinates-group">
						<input id="latitude" name="latitude" type="text" class="form-input">
						<div>/</div>
						<input type="text" class="form-input">
					</div>
				</div>

				<div class="form-group">
					<label for="natural-object" class="form-label">Type of natural object:</label>
					<input id="natural-object" type="text" class="form-input">
				</div>

				<div class="form-group">
					<label for="owner-of-place"  class="form-label">Owner of the place:</label>
					<input id="owner-of-place" name="owner-of-place" type="text" class="form-input">
				</div>

				<div class="form-group">
					<label for="operations-manager" class="form-label">Operations manager:</label>
					<input id="operations-" name="operations-" type="text" class="form-input">
				</div>

				<div class="form-group">
					<label for="date-of-work" class="form-label">Date of work:</label>
					<input id="date-of-work" name="date-of-work" type="date" class="form-input">
				</div>

				<div class="form-group">
					<label for="type-of-work" class="form-label">Type of work:</label>
					<input id="type-of-work" form="type-of-work" type="text" class="form-input">
				</div>

				<div class="form-group">
					<label for="receiver-id" class="form-label">Receiver ID:</label>
					<input id="type-of-work" name="type-of-work" type="text" class="form-input">
				</div>

				<button class="submit-button">
					Submit
				</button>
			</div>
		</div>
	</div>
</main>

<style>
	.page-container {
		background: linear-gradient(to bottom right, #f6d8d5, transparent, #f5f5f5);
		min-height: 100vh;
		position: relative;
	}

	.content-wrapper {
		display: grid;
		gap: 64px;
		grid-template-columns: 1fr 320px;
		padding: 5rem 3rem 3rem 3rem;
		position: relative;
		z-index: 2;
	}

	@media (min-width: 1024px) {
		.content-wrapper {
			margin-right: 32px;
		}
	}

	.cards-grid {
		align-items: start;
		display: grid;
		gap: 2rem;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	}

	.sidebar {
		height: fit-content;
		max-width: 320px;
		position: sticky;
		top: 64px;
		width: 100%;
	}

	.sidebar h2 {
		font-weight: 900;
		margin-bottom: 2rem;
	}

	.form-group {
		display: grid;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	.form-label {
		font-size: 0.875rem;
	}

	.form-input {
		border-radius: 0.5rem;
		width: 100%;
		padding: 0.5rem;
	}

	.coordinates-group {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.coordinates-group input {
		width: 100%;
	}

	.submit-button {
		position: sticky;
		top: 24px;
		padding: 1rem;
		background-color: #171717;
		color: white;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		width: 100%;
		display: block;
		font-weight: bold;
	}

	.grain {
		z-index: 0;
		position: fixed;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		transform: translateZ(0);
	}

	.grain:before {
		content: "";
		top: -10rem;
		left: -10rem;
		width: calc(100% + 20rem);
		height: calc(100% + 20rem);
		z-index: 9999;
		position: fixed;
		background-image: url(https://upload.wikimedia.org/wikipedia/commons/5/5c/Image_gaussian_noise_example.png);
		opacity: 0.1;
		pointer-events: none;
		animation: noise 1s steps(2) infinite;
	}

	@keyframes noise {
		0% { transform: translate3d(0, 9rem, 0) }
		10% { transform: translate3d(-1rem, -4rem, 0) }
		20% { transform: translate3d(-8rem, 2rem, 0) }
		30% { transform: translate3d(9rem, -9rem, 0) }
		40% { transform: translate3d(-2rem, 7rem, 0) }
		50% { transform: translate3d(-9rem, -4rem, 0) }
		60% { transform: translate3d(2rem, 6rem, 0) }
		70% { transform: translate3d(7rem, -8rem, 0) }
		80% { transform: translate3d(-9rem, 1rem, 0) }
		90% { transform: translate3d(6rem, -5rem, 0) }
		100% { transform: translate3d(-7rem, 0, 0) }
	}
</style>
