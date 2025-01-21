<script lang="ts">
	import type { BidiCertificate } from '$lib/certificate'
	import Input from '$lib/components/Input.svelte'
	import MissionSelector from '$lib/components/MissionSelector.svelte'
	import Textarea from '$lib/components/Textarea.svelte'
	import type { Mission } from '$lib/directus'
	import { AccountId } from '@hashgraph/sdk'

	const coordinatePattern = /\d{3}\s?\d{3}/

	let {
		missions,
		onsubmit,
	}: {
		missions?: Mission[]
		onsubmit: (options: {
			certificate: BidiCertificate
			recipientAccountId: AccountId
			missionTitle: string
		}) => void
	} = $props()

	let selectedMission = $state<Mission | undefined>(missions?.[0])
	// mission
	let missionTitle = $state('')
	let swissGridEString = $state('')
	const swissGridE = $derived(parseInt(swissGridEString.replace(/\s/g, '')))
	let swissGridNString = $state('')
	const swissGridN = $derived(parseInt(swissGridNString.replace(/\s/g, '')))
	let typeOfNaturalObject = $state('')
	let dateOfWork = $state('')
	let typeOfWork = $state('')
	let effectOnBiodiversity = $state('')
	// certificate/nft
	let recipientAccountIdString = $state('')
	let numberOfHoursOfWork = $state(1)
	const numberOfBidi = $derived(numberOfHoursOfWork * 15)

	$effect(() => {
		if (selectedMission) {
			missionTitle = selectedMission.title
			swissGridEString = selectedMission.E.toString()
			swissGridNString = selectedMission.N.toString()
			typeOfNaturalObject = selectedMission.type_of_natural_object
			typeOfWork = selectedMission.type_of_work
			dateOfWork = selectedMission.date
			effectOnBiodiversity = selectedMission.effect_on_biodiversity
		}
	})
</script>

<form
	onsubmit={(event) => {
		event.preventDefault()

		// TODO: handle errors
		if (isNaN(swissGridE)) {
			return
		}

		if (isNaN(swissGridN)) {
			return
		}

		const certificate: BidiCertificate = {
			coordinates: {
				E: swissGridE,
				N: swissGridN,
			},
			typeOfNaturalObject,
			dateOfWork,
			typeOfWork,
			effectOnBiodiversity,
			numberOfHoursOfWork,
			numberOfBidi,
		}

		const recipientAccountId = AccountId.fromString(recipientAccountIdString)

		onsubmit({
			certificate,
			recipientAccountId,
			missionTitle,
		})
	}}
>
	{#if missions}
		<MissionSelector
			label="Select a mission for which to create a certificate"
			{missions}
			bind:selectedMission
			required
		/>
	{:else}
		<fieldset>
			<legend>Mission</legend>

			<Input label="Mission title" bind:value={missionTitle} required />

			<fieldset class="coordinates-group">
				<legend>Coordinates:</legend>

				<Input
					label="E"
					placeholder="600 000"
					bind:value={swissGridEString}
					required
					pattern={coordinatePattern}
				/>

				<Input
					label="N"
					placeholder="200 000"
					bind:value={swissGridNString}
					required
					pattern={coordinatePattern}
				/>
			</fieldset>

			<Input label="Type of natural object" bind:value={typeOfNaturalObject} required />

			<Input type="date" label="Date of work" bind:value={dateOfWork} required />

			<Textarea label="Type of work" bind:value={typeOfWork} required />

			<Textarea label="Effect on biodiversity" bind:value={effectOnBiodiversity} required />
		</fieldset>
	{/if}

	<fieldset>
		<legend>Certificate</legend>
		<Input
			label="Recipient ID"
			bind:value={recipientAccountIdString}
			required
			pattern={/\d+\.\d+\.\d+/}
		/>

		<Input
			type="number"
			label="Number of hours of work"
			min={1}
			step={1}
			bind:value={
				() => numberOfHoursOfWork.toString(),
				(newNumberOfHoursOfWork) => {
					numberOfHoursOfWork = parseInt(newNumberOfHoursOfWork)
				}
			}
			required
		/>

		<Input type="number" label="Number of BIDI" value={numberOfBidi.toString()} required readonly />
	</fieldset>

	<button type="submit" class="submit-button">Submit</button>
</form>

<style>
	form {
		display: grid;
		gap: 2rem;
	}

	.coordinates-group {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.submit-button {
		display: block;
		position: sticky;
		top: 24px;
		border-radius: 0.5rem;
		background-color: #171717;
		padding: 1rem;
		width: 100%;
		color: white;
		font-weight: bold;
		font-size: 0.875rem;
	}
</style>
