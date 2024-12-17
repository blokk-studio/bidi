<script lang="ts">
	let {
		label,
		value = $bindable(),
		type = 'text',
		required,
		placeholder,
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
		placeholder?: string
	} = $props()
</script>

<label>
	<span>{label}</span>

	<input bind:value {required} {type} {placeholder} />
</label>

<style>
	label {
		display: grid;
		gap: 0.25rem;
	}

	span {
		font-size: 0.875rem;
	}

	input {
		border-radius: 0.5rem;
		padding: 0.5rem;
		width: 100%;
	}
</style>
