<script lang="ts">
	import type { Mission } from '$lib/directus'

	let {
		selectedMission = $bindable(),
		missions,
		required,
		label,
	}: {
		selectedMission?: Mission
		missions: Mission[]
		label: string
		required?: boolean
	} = $props()
</script>

<fieldset class="missionGrid">
	<legend>{label}</legend>

	{#each missions as mission}
		<label>
			<input type="radio" name="mission" bind:group={selectedMission} value={mission} {required} />

			{mission.title}
		</label>
	{/each}
</fieldset>

<style>
	.missionGrid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 1rem;
		row-gap: 0.5rem;
	}
</style>
