<script lang="ts">
	import MultilineText from '$lib/components/MultilineText.svelte'
	import containerStyles from '$lib/css/container.module.css'
	import navigationLinkStyles from '$lib/css/navigationLink.module.css'
	import { contractId, nftTokenId } from '$lib/deployment.js'
	import HashConnectLoader from '$lib/hashconnect/HashConnectLoader.svelte'
	import { associateWithToken } from '$lib/hedera/collection/associate'
	import { claimNftWithExecutor } from '$lib/hedera/collection/claim.js'
	import { getCoordinateString, getDecimalLatitudeLongitude } from '$lib/swissGrid.js'
	import Claim from 'lucide-svelte/icons/file-down'
	import Associate from 'lucide-svelte/icons/handshake'

	let { data } = $props()

	const decimalLatitudeLongitude = $derived(
		data.mission.E && data.mission.N
			? getDecimalLatitudeLongitude({ E: data.mission.E, N: data.mission.N })
			: null,
	)
	const mapSearchParams = $derived.by(() => {
		const urlSearchParams = new URLSearchParams()
		if (!decimalLatitudeLongitude) {
			return urlSearchParams
		}
		const bbox = `${
			decimalLatitudeLongitude.longitude - 0.01
		},${decimalLatitudeLongitude.latitude - 0.01},${
			decimalLatitudeLongitude.longitude + 0.01
		},${decimalLatitudeLongitude.latitude + 0.01}`
		urlSearchParams.set('bbox', bbox)

		const marker = `${decimalLatitudeLongitude.latitude},${decimalLatitudeLongitude.longitude}`
		urlSearchParams.set('marker', marker)

		return urlSearchParams
	})
</script>

<main class={containerStyles.container}>
	<h1>{data.mission.title}</h1>

	<time datetime={data.mission.date}>
		{new Date(data.mission.date).toLocaleDateString()}
	</time>
	<p><MultilineText text={data.mission.type_of_work} /></p>

	<h2>Effect on biodiversity</h2>
	<p><MultilineText text={data.mission.effect_on_biodiversity} /></p>

	{#if decimalLatitudeLongitude && data.mission.E && data.mission.N}
		<h2>Location</h2>

		<p>
			Coordinates:

			{getCoordinateString(data.mission.E)} / {getCoordinateString(data.mission.N)}
		</p>

		<figure>
			<iframe
				title="{data.mission.title} on the map"
				width="100%"
				height="auto"
				src="https://www.openstreetmap.org/export/embed.html?{mapSearchParams.toString()}"
				class="map"
			></iframe>
			<small>
				<a
					href="https://www.openstreetmap.org/#map=8/{decimalLatitudeLongitude.latitude}/{decimalLatitudeLongitude.longitude}"
				>
					View on OpenStreetMap
				</a>
			</small>
		</figure>
	{/if}

	{#if data.nfts.length}
		<h2>NFTs</h2>

		<div role="presentation" class="nftListContainer">
			<ul class="nftList">
				{#each data.nfts as nft}
					<li>
						<a href="/certificates/{nft.serialNumber}" class={navigationLinkStyles.navigationLink}>
							<figure class="nftListItem">
								<img src={nft.imageUrl} alt="Image of certificate {nft.name}" class="nftTile" />

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
</main>

<style>
	img {
		margin-top: 1rem;
	}

	h2 {
		margin-top: 2rem;
	}

	.map {
		aspect-ratio: 1;
	}

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
