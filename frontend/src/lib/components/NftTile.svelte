<script lang="ts">
	import type { Nft } from '$lib/nft'

	let {
		serialNumber,
		imageUrl,
		certificate,
	}: Pick<Nft, 'serialNumber' | 'imageUrl' | 'certificate'> = $props()
</script>

<figure class="nft-card">
	<img src={imageUrl} alt="Image of certificate #{serialNumber}" />
	<time datetime={certificate.dateOfWork}>
		{new Date(certificate.dateOfWork).toLocaleDateString()}
	</time>
	<button class="claim-button">
		<span class="index-number">#{serialNumber}</span>
		<span class="claim-text">Claim</span>
	</button>
</figure>

<style>
	.nft-card {
		display: grid;
		position: relative;
		grid-template-columns: 1fr auto;
		grid-template-areas:
			'image image'
			'date claim';
		justify-self: center;
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
		border-radius: 1rem;
		background-color: white;
		width: 100%;
	}

	.nft-card img {
		grid-area: image;
		border-radius: 1rem;
		width: fit-content;
		height: fit-content;
	}

	time {
		display: block;
		grid-area: date;
		margin-bottom: 10px;
		margin-left: 10px;
		padding: 0.5rem;
	}

	.claim-button {
		position: relative;
		grid-area: claim;
		justify-self: end;
		transition: background-color 0.2s ease-in-out;
		cursor: pointer;
		margin-right: 10px;
		margin-bottom: 10px;
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
