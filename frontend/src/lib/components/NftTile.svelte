<script lang="ts">
	import type { Nft } from '$lib/nft'

	let { serialNumber }: Pick<Nft, 'serialNumber'> = $props()
</script>

<figure class="nft-card">
	<img src="/0.png" alt="" />
	<button class="claim-button">
		<span class="index-number">#{serialNumber}</span>
		<span class="claim-text">Claim</span>
	</button>
</figure>

<style>
	.nft-card {
		position: relative;
		justify-self: center;
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
		border-radius: 1rem;
		background-color: white;
		padding-bottom: 2rem;
		width: 100%;
	}

	.nft-card img {
		border-radius: 1rem;
		width: fit-content;
		height: fit-content;
	}

	.claim-button {
		position: absolute;
		right: 10px;
		bottom: 10px;
		transition: background-color 0.2s ease-in-out;
		cursor: pointer;
		border-radius: 0.75rem;
		background-color: rgb(253 242 248); /* pink-50 */
		padding: 0.5rem;
		width: 102px;
		height: 40px;
		overflow: hidden;
		font-size: 0.875rem;
		text-align: right;
		text-transform: uppercase;
	}

	.claim-button:hover {
		background-color: rgb(239 246 255); /* blue-50 */
	}

	.index-number {
		position: absolute;
		top: 0;
		right: 0;
		transition:
			transform 0.2s ease-in-out,
			opacity 0.2s ease-in-out;
		padding: 0.5rem;
	}

	.claim-button:hover .index-number {
		transform: translateY(-40px);
		opacity: 0;
	}

	.claim-text {
		display: flex;
		position: absolute;
		top: 100%;
		right: 0;
		align-items: center;
		opacity: 0;
		transition:
			transform 0.2s ease-in-out,
			opacity 0.2s ease-in-out;
		padding: 0.5rem;
		height: 100%;
		font-weight: bold;
		font-size: 0.75rem;
	}

	.claim-button:hover .claim-text {
		transform: translateY(-40px);
		opacity: 1;
	}
</style>
