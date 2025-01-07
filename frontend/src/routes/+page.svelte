<script lang="ts">
	import containerStyles from '$lib/css/container.module.css'
	import MissionTeaser from './MissionTeaser.svelte'

	let { data } = $props()
</script>

<main class={containerStyles.container}>
	<h1>Missions</h1>

	{#if !data.nfts.length}
		<p>No NFTs have been minted yet.</p>
	{:else}
		<ul class="missionList">
			{#each data.nfts as nft}
				<li>
					<MissionTeaser {...nft.certificate} serialNumber={nft.serialNumber} />
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style>
	.missionList {
		display: grid;
		gap: 2rem;
		margin-top: 2rem;
	}
</style>
