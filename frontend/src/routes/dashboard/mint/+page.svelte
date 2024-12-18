<script lang="ts">
	import type { BidiCertificate } from '$lib/certificate'
	import NftTile from '$lib/components/NftTile.svelte'
	import { contractId, nftTokenId } from '$lib/deployment'
	import type { PairedReactiveHashConnect } from '$lib/hashconnect/hashConnect.svelte'
	import HashConnectLoader from '$lib/hashconnect/HashConnectLoader.svelte'
	import { mintNftWithExecutor } from '$lib/hedera/collection/mint'
	import { getStatefulAsyncFunction } from '$lib/statefulAsyncFuntion.svelte'
	import type { AccountId } from '@hashgraph/sdk'
	import CertificateCreationForm from './CertificateCreationForm.svelte'
	import containerStyles from '$lib/css/container.module.css'
	import type { Nft } from '$lib/nft'

	const uploadMetadata = async (certificate: BidiCertificate) => {
		console.debug('TODO: upload this', certificate)

		await new Promise((resolve) => setTimeout(resolve, 2000))
		// TODO: upload to ipfs & return url
		return 'ipfs://bafyreie3ichmqul4xa7e6xcy34tylbuq2vf3gnjf7c55trg3b6xyjr4bku/metadata.json'
	}

	let nftCreationState = $state<'uploadingMetadata' | 'mintingNft'>()
	const statefulCreateCertificateNft = getStatefulAsyncFunction(
		async (options: {
			hashConnect: PairedReactiveHashConnect
			certificate: BidiCertificate
			recipientAccountId: AccountId
		}) => {
			nftCreationState = 'uploadingMetadata'
			const metadataUrl = await uploadMetadata(options.certificate)

			nftCreationState = 'mintingNft'
			const mintNftResult = await mintNftWithExecutor({
				allowedClaimerAccountId: options.recipientAccountId,
				contractId: contractId,
				tokenId: nftTokenId,
				executeTransaction: options.hashConnect.session.executeTransaction,
				metadataUrl,
			})

			nftCreationState = undefined

			const nft: Nft = {
				// TODO: return the metadata from the upload to use here
				imageUrl: '/0.png',
				name: 'TODO:',
				serialNumber: mintNftResult.serialNumber,
			}

			return nft
		},
	)
</script>

<main class={containerStyles.container}>
	<h2>Create a certificate:</h2>

	<HashConnectLoader>
		{#snippet paired({ hashConnect })}
			<div aria-live="polite" aria-busy={statefulCreateCertificateNft.isPending}>
				{#if !statefulCreateCertificateNft.result}
					{#if statefulCreateCertificateNft.error}
						<div role="alert">
							<details>
								<summary> Unable to create the NFT </summary>

								{statefulCreateCertificateNft.error.message}
								{#if statefulCreateCertificateNft.error.stack}
									<pre>{statefulCreateCertificateNft.error.stack}</pre>
								{/if}
							</details>
						</div>
					{/if}
					{#if statefulCreateCertificateNft.isPending}
						{#if nftCreationState === 'uploadingMetadata'}
							<p role="status">Uploading metadata</p>
						{:else if nftCreationState === 'mintingNft'}
							<p role="status">Minting NFT</p>
						{/if}
					{/if}

					<CertificateCreationForm
						onsubmit={(certificateCreation) => {
							statefulCreateCertificateNft.call({
								certificate: certificateCreation.certificate,
								recipientAccountId: certificateCreation.recipientAccountId,
								hashConnect,
							})
						}}
					/>
				{:else}
					<p role="status">Nft Created!</p>

					<NftTile {...statefulCreateCertificateNft.result} />
				{/if}
			</div>
		{/snippet}
	</HashConnectLoader>
</main>

<style>
	h2 {
		margin-top: 3rem;
		margin-bottom: 1rem;
	}
</style>
