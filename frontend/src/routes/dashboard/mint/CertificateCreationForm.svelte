<script lang="ts">
	import type { BidiCertificate } from '$lib/certificate'
	import Input from '$lib/components/Input.svelte'
	import Textarea from '$lib/components/Textarea.svelte'
	import { AccountId } from '@hashgraph/sdk'

	let {
		onsubmit,
	}: {
		onsubmit: (options: { certificate: BidiCertificate; recipientAccountId: AccountId }) => void
	} = $props()

	let latitudeString = $state('')
	let longitudeString = $state('')
	let typeOfNaturalObject = $state('')
	let locationOwner = $state('')
	let operationsManager = $state('')
	let dateOfWork = $state('')
	let typeOfWork = $state('')
	let effectOnBiodiversity = $state('')
	let recipientAccountIdString = $state('')
</script>

<form
	onsubmit={(event) => {
		event.preventDefault()

		// TODO: handle errors
		const latitude = parseFloat(latitudeString)
		if (!latitude || isNaN(latitude)) {
			return
		}

		const longitude = parseFloat(longitudeString)
		if (!longitude || isNaN(longitude)) {
			return
		}

		const certificate: BidiCertificate = {
			latitude,
			longitude,
			typeOfNaturalObject,
			locationOwner,
			operationsManager,
			dateOfWork,
			typeOfWork,
			effectOnBiodiversity,
		}

		const recipientAccountId = AccountId.fromString(recipientAccountIdString)

		onsubmit({
			certificate,
			recipientAccountId,
		})
	}}
>
	<div class="form-group">
		<fieldset class="coordinates-group">
			<legend>Coordinates:</legend>

			<Input
				label="Latitude"
				placeholder="46.8"
				bind:value={latitudeString}
				required
				pattern={/\d+(?:\.\d+)?/}
			/>

			<Input
				label="Longitude"
				placeholder="8.233333"
				bind:value={longitudeString}
				required
				pattern={/\d+(?:\.\d+)?/}
			/>
		</fieldset>
	</div>

	<Input label="Type of natural object" bind:value={typeOfNaturalObject} required />

	<Input label="Owner of the place" bind:value={locationOwner} required />

	<Input label="Operations manager" bind:value={operationsManager} required />

	<Input type="date" label="Date of work" bind:value={dateOfWork} required />

	<Textarea label="Type of work" bind:value={typeOfWork} required />

	<Textarea label="Effect on biodiversity" bind:value={effectOnBiodiversity} required />

	<Input
		label="Recipient ID"
		bind:value={recipientAccountIdString}
		required
		pattern={/\d+\.\d+\.\d+/}
	/>

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
