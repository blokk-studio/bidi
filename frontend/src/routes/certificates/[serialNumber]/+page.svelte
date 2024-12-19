<script lang="ts">
	import containerStyles from '$lib/css/container.module.css'
	import { contractId, nftTokenId } from '$lib/deployment.js'
	import HashConnectLoader from '$lib/hashconnect/HashConnectLoader.svelte'
	import { associateWithToken } from '$lib/hedera/collection/associate'
	import { claimNftWithExecutor } from '$lib/hedera/collection/claim.js'

	let { data } = $props()
</script>

<main class={containerStyles.container}>
	<h1>{data.nft.name} #{data.nft.serialNumber}</h1>

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
				>
					Claim
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
				>
					Associate with BIDI
				</button>
			{/if}
		{/snippet}
	</HashConnectLoader>

	<img src={data.nft.imageUrl} alt="Image of certificate #{data.nft.serialNumber}" />

	<p>{new Date(data.nft.certificate.dateOfWork).toLocaleDateString()}</p>
	<p>{data.nft.certificate.swissGridE} / {data.nft.certificate.swissGridN}</p>
	<p>{data.nft.certificate.operationsManager}</p>
	<p>{data.nft.certificate.typeOfNaturalObject}</p>
	<p>{data.nft.certificate.typeOfWork}</p>
	<p>{data.nft.certificate.effectOnBiodiversity}</p>
</main>

<style>
	h1 {
		padding-top: 3rem;
	}

	img {
		margin-top: 1rem;
	}
</style>
