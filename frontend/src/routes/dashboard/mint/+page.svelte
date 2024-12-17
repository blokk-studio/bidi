<script lang="ts">
	import type { BidiCertificate } from '$lib/certificate'
	import NftTile from '$lib/components/NftTile.svelte'
	import { contractId, nftTokenId } from '$lib/deployment'
	import type { PairedReactiveHashConnect } from '$lib/hashconnect/hashConnect.svelte'
	import HashConnectLoader from '$lib/hashconnect/HashConnectLoader.svelte'
	import { mintNftWithExecutor } from '$lib/hedera/collection/mint'
	import { getStatefulAsyncFunction } from '$lib/statefulAsyncFuntion.svelte'
	import CertificateCreationForm from './CertificateCreationForm.svelte'

	const uploadMetadata = async (certificate: BidiCertificate) => {
		console.debug('TODO: upload this', certificate)

		await new Promise((resolve) => setTimeout(resolve, 2000))
		// TODO: upload to ipfs & return url
		return 'ipfs://bafyreie3ichmqul4xa7e6xcy34tylbuq2vf3gnjf7c55trg3b6xyjr4bku/metadata.json'
	}

	let nftCreationState = $state<'uploadingMetadata' | 'mintingNft'>()
	const statefulCreateCertificateNft = getStatefulAsyncFunction(
		async (options: { hashConnect: PairedReactiveHashConnect; certificate: BidiCertificate }) => {
			nftCreationState = 'uploadingMetadata'
			const metadataUrl = await uploadMetadata(options.certificate)

			nftCreationState = 'mintingNft'
			const nft = await mintNftWithExecutor({
				allowedClaimerAccountId: options.hashConnect.session.accountId,
				contractId: contractId,
				tokenId: nftTokenId,
				executeTransaction: options.hashConnect.session.executeTransaction,
				metadataUrl,
			})

			nftCreationState = undefined

			return nft
		},
	)
</script>

<main>
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
						onsubmit={(certificate) => {
							statefulCreateCertificateNft.call({
								certificate,
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
	main {
		margin-inline: max(1rem, 50% - 20rem);
	}

	h2 {
		margin-top: 3rem;
		margin-bottom: 1rem;
	}
</style>
