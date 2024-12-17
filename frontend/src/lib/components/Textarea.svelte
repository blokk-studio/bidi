<script lang="ts">
	let {
		label,
		value = $bindable(),
		required,
		placeholder,
		rows = 6,
	}: {
		label: string
		value: string
		required?: boolean
		placeholder?: string
		rows?: number
	} = $props()
</script>

<label>
	<span>{label}</span>

	<textarea bind:value {required} {placeholder} {rows}></textarea>
</label>

<style>
	label {
		display: grid;
		gap: 0.25rem;
	}

	span {
		font-size: 0.875rem;
	}

	textarea {
		border-radius: 0.5rem;
		padding: 0.5rem;
		width: 100%;
	}
</style>
