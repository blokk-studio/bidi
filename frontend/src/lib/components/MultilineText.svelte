<script lang="ts">
	let { text }: { text: string } = $props()

	const lines = $derived(text.split(/\n/g))
</script>

{#each lines as line}
	<span class="line">{line}</span>
{/each}

<style>
	.line {
		display: block;
	}
</style>
