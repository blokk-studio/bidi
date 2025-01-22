<script lang="ts">
	import { contractId, nftTokenId } from '$lib/deployment'
	import HashConnectLoader from '$lib/hashconnect/HashConnectLoader.svelte'
	import { getNfts } from '$lib/hedera/getNfts'
	import containerStyles from '$lib/css/container.module.css'
	import navigationLinkStyles from '$lib/css/navigationLink.module.css'
	import { claimNftWithExecutor } from '$lib/hedera/collection/claim'
	import Claim from 'lucide-svelte/icons/file-down'
	import { associateWithToken } from '$lib/hedera/collection/associate'
	import Associate from 'lucide-svelte/icons/handshake'
</script>

<main class={containerStyles.container}>
	<h1>BIDI Dashboard</h1>

	<HashConnectLoader>
		{#snippet withAccountInformation({ hashConnect })}
			{#await getNfts( { ledgerId: hashConnect.session.ledgerId, tokenId: nftTokenId }, ).then( (nfts) => {
					const userOwnedNfts = nfts.filter((nft) => {
						return nft.claimerAccountId.equals(hashConnect.session.accountId) && !nft.isClaimed
					})

					return userOwnedNfts
				}, ) then nfts}
				{#if nfts.length}
					<h2>Your unclaimed certificates</h2>

					<div role="presentation" class="nftListContainer">
						<ul class="nftList">
							{#each nfts as nft}
								<li>
									<figure class="nftListItem">
										<img src={nft.imageUrl} alt="Image of certificate {nft.name}" class="nftTile" />

										<div role="presentation">
											<span class="nftSerialNumber">#{nft.serialNumber}</span>

											{nft.name}
										</div>
									</figure>
									{#if hashConnect.accountInformation.hasAssociatedWithToken}
										<button
											onclick={() => {
												claimNftWithExecutor({
													contractId: contractId,
													tokenId: nftTokenId,
													serialNumber: nft.serialNumber,
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
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			{/await}

			<h2 class="claimedCertificatesHeading">Claimed certificates</h2>
			{#await getNfts( { ledgerId: hashConnect.session.ledgerId, tokenId: nftTokenId, accountId: hashConnect.session.accountId }, )}
				<p role="status">Loading your certificates...</p>
			{:then nfts}
				{#if !nfts.length}
					<p>You don't have any certificates.</p>
				{:else}
					<div role="presentation" class="nftListContainer">
						<ul class="nftList">
							{#each nfts as nft}
								<li>
									<a
										href="/certificates/{nft.serialNumber}"
										class={navigationLinkStyles.navigationLink}
									>
										<figure class="nftListItem">
											<img
												src={nft.imageUrl}
												alt="Image of certificate {nft.name}"
												class="nftTile"
											/>

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
			{/await}
		{/snippet}
	</HashConnectLoader>
</main>

<style>
	.claimedCertificatesHeading {
		margin-top: 3rem;
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
