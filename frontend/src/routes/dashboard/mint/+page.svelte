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
	import { generateNftCertificate } from '$lib/certificate-generator/generate-certificate'

	let { data } = $props()

	const uploadMetadata = async (options: {
		missionTitle: string
		certificate: BidiCertificate
	}) => {
		try {
			const formData = new FormData()
			formData.append('metadata', JSON.stringify(options.certificate))
			formData.append('missionTitle', options.missionTitle)

			// todo custom qr code url? defaulting to bidigut.ch for now
			// had to generate this on the frontend cause of canvas stuff
			const certificateImage = await generateNftCertificate('https://bidigut.ch', {
				mission: options.missionTitle,
				dateOfWork: options.certificate.dateOfWork,
				operationsManager: 'todo',
				bidiEarned: options.certificate.numberOfBidi.toString(),
			})

			formData.append('certificateImage', certificateImage)

			const response = await fetch('/api/pinata/upload', {
				method: 'POST',
				body: formData,
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const data = await response.json()

			console.log('metadata url:', data?.metadataUrl)
			return data.metadataUrl
		} catch (error) {
			console.error('Upload failed:', error)
			throw error
		}
	}

	let nftCreationState = $state<'uploadingMetadata' | 'mintingNft'>()
	const statefulCreateCertificateNft = getStatefulAsyncFunction(
		async (options: {
			hashConnect: PairedReactiveHashConnect
			certificate: BidiCertificate
			recipientAccountId: AccountId
			missionTitle: string
		}) => {
			nftCreationState = 'uploadingMetadata'
			const metadataUrl = await uploadMetadata(options)

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
				certificate: options.certificate,
				claimerAccountId: options.recipientAccountId,
				isClaimed: false,
			}

			return nft
		},
	)
</script>

<main class={containerStyles.container}>
	<h1>Create a certificate</h1>

	<HashConnectLoader>
		{#snippet withAccountInformation({ hashConnect })}
			{#if !hashConnect.accountInformation.canMint}
				<p role="alert">You are not allowed to create certificates.</p>
			{:else}
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
							missions={data.missions}
							onsubmit={(certificateCreation) => {
								statefulCreateCertificateNft.call({
									certificate: certificateCreation.certificate,
									recipientAccountId: certificateCreation.recipientAccountId,
									hashConnect,
									missionTitle: certificateCreation.missionTitle,
								})
							}}
						/>
					{:else}
						<p role="status">Nft Created!</p>

						<NftTile {...statefulCreateCertificateNft.result} />
					{/if}
				</div>
			{/if}
		{/snippet}
	</HashConnectLoader>
</main>

<style>
	h1 {
		margin-top: 2rem;
		margin-bottom: 1rem;
	}
</style>
