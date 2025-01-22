<script lang="ts">
	import containerStyles from '$lib/css/container.module.css'
	import MissionTeaser from './MissionTeaser.svelte'

	let { data } = $props()
</script>

<main class={containerStyles.container}>
	<h1>Missions</h1>

	{#if !data.missions.length}
		<p>No missions have taken place yet.</p>
	{:else}
		<ul class="missionList">
			{#each data.missions as mission}
				<li>
					<MissionTeaser
						title={mission.title}
						dateOfWork={mission.date}
						typeOfWork={mission.type_of_work}
						route="/missions/{mission.slug}"
					/>
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
