<script lang="ts">
	import type { BidiCertificate } from '$lib/certificate'
	import Input from '$lib/components/Input.svelte'
	import Textarea from '$lib/components/Textarea.svelte'
	import { AccountId } from '@hashgraph/sdk'

	const coordinatePattern = /\d{3}\s?\d{3}/

	let {
		onsubmit,
	}: {
		onsubmit: (options: { certificate: BidiCertificate; recipientAccountId: AccountId }) => void
	} = $props()

	let swissGridEString = $state('')
	const swissGridE = $derived(parseInt(swissGridEString.replace(/\s/g, '')))
	let swissGridNString = $state('')
	const swissGridN = $derived(parseInt(swissGridNString.replace(/\s/g, '')))
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
		if (isNaN(swissGridE)) {
			return
		}

		if (isNaN(swissGridN)) {
			return
		}

		const certificate: BidiCertificate = {
			swissGridE,
			swissGridN,
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
