<script lang="ts">
	let {
		label,
		value = $bindable(),
		type = 'text',
		required,
		readonly,
		placeholder,
		pattern,
	}: {
		label: string
		value: string
		type?:
			| 'button'
			| 'checkbox'
			| 'color'
			| 'date'
			| 'datetime-local'
			| 'email'
			| 'file'
			| 'hidden'
			| 'image'
			| 'month'
			| 'number'
			| 'password'
			| 'radio'
			| 'range'
			| 'reset'
			| 'search'
			| 'submit'
			| 'tel'
			| 'text'
			| 'time'
			| 'url'
			| 'week'
		required?: boolean
		readonly?: boolean
		placeholder?: string
		pattern?: RegExp
		min?: number
		max?: number
		step?: number
	} = $props()
</script>

<label>
	<span>{label}</span>

	<input bind:value {required} {readonly} {type} {placeholder} pattern={pattern?.source} />
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

	input {
		border-width: 0.125rem;
		border-style: solid;
		border-color: currentColor;
		border-radius: 0.5rem;
		padding-inline: 1rem;
		padding-block: 0.75rem;
		width: 100%;

		&[readonly] {
			border-color: color-mix(in srgb, currentColor 30%, transparent 100%);
		}
	}
</style>
