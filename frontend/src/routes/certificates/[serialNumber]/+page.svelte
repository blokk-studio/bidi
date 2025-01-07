<script lang="ts">
	import containerStyles from '$lib/css/container.module.css'
	import navigationLinkStyles from '$lib/css/navigationLink.module.css'
	import { contractId, nftTokenId } from '$lib/deployment.js'
	import HashConnectLoader from '$lib/hashconnect/HashConnectLoader.svelte'
	import { associateWithToken } from '$lib/hedera/collection/associate'
	import { claimNftWithExecutor } from '$lib/hedera/collection/claim.js'
	import { getDecimalLatitudeLongitude } from '$lib/swissGrid.js'
	import Claim from 'lucide-svelte/icons/file-down'
	import Associate from 'lucide-svelte/icons/handshake'

	let { data } = $props()

	const decimalLatitudeLongitude = $derived(
		getDecimalLatitudeLongitude({
			E: data.nft.certificate.swissGridE,
			N: data.nft.certificate.swissGridN,
		}),
	)
	const mapSearchParams = $derived.by(() => {
		const urlSearchParams = new URLSearchParams()
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
	<h1>{data.nft.certificate.typeOfNaturalObject}</h1>

	<time datetime={data.nft.certificate.dateOfWork}>
		{new Date(data.nft.certificate.dateOfWork).toLocaleDateString()}
	</time>
	<p>{data.nft.certificate.typeOfWork}</p>

	<p>Operations manager: {data.nft.certificate.operationsManager}</p>

	<h2>Effect on biodiversity</h2>
	<p>{data.nft.certificate.effectOnBiodiversity}</p>

	<h2>Location</h2>

	<p>
		Coordinates

		{data.nft.certificate.swissGridE?.toLocaleString()} / {data.nft.certificate.swissGridN?.toLocaleString()}
	</p>

	<figure>
		<iframe
			title="{data.nft.certificate.typeOfWork} on the map"
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

	<h2>NFT</h2>
	<HashConnectLoader>
		{#snippet withAccountInformation({ hashConnect })}
			{#if hashConnect.accountInformation.hasAssociatedWithToken}
				<button
					onclick={() => {
						claimNftWithExecutor({
							contractId: contractId,
							tokenId: nftTokenId,
							serialNumber: data.nft.serialNumber,
							executeTransaction: hashConnect.session.executeTransaction,
						})
					}}
					class="{navigationLinkStyles.navigationLink} {navigationLinkStyles.withIconRight}"
				>
					Claim this NFT

					<Claim aria-hidden="true" />
				</button>
			{:else}
				<button
					onclick={async () => {
						const associateWithTokenResult = await associateWithToken({
							accountId: hashConnect.session.accountId,
							tokenId: nftTokenId,
							executeTransaction: hashConnect.session.executeTransaction,
						})

						hashConnect.accountInformation.hasAssociatedWithToken =
							associateWithTokenResult.hasAssociatedWithToken
					}}
					class="{navigationLinkStyles.navigationLink} {navigationLinkStyles.withIconRight}"
				>
					Associate with BIDI

					<Associate aria-hidden="true" />
				</button>
			{/if}
		{/snippet}
	</HashConnectLoader>

	<img src={data.nft.imageUrl} alt="Image of certificate #{data.nft.serialNumber}" />
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
</style>
