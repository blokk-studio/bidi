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
		font-weight: 600;
		font-size: 0.875rem;
	}

	textarea {
		border-width: 0.125rem;
		border-style: solid;
		border-color: currentColor;
		border-radius: 0.5rem;
		padding-inline: 1rem;
		padding-block: 0.75rem;
		width: 100%;
	}
</style>
