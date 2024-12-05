<script lang="ts">
	import type { Snippet } from 'svelte'
	import {
		useHashConnect,
		type ReactiveHashConnect,
	} from '../../lib/hashconnect/hashConnect.svelte'

	let {
		children,
	}: {
		children: Snippet<[{ hashConnect: ReactiveHashConnect }]>
	} = $props()

	const hashConnect = $derived(useHashConnect())
</script>

{#if !hashConnect}
	<span>Loading HashConnect</span>
{:else}
	{@render children({ hashConnect: hashConnect })}
{/if}
