<script lang="ts">
	import type { Snippet } from 'svelte'
	import {
		hashConnect,
		isInitialized,
		isPaired,
		type InitializedReactiveHashConnect,
		type PairedReactiveHashConnect,
		type UninitializedReactiveHashConnect,
	} from './hashConnect.svelte'

	let {
		paired,
		initialized,
		loading,
	}: {
		loading?: Snippet<[{ hashConnect: UninitializedReactiveHashConnect }]>
		initialized?: Snippet<[{ hashConnect: InitializedReactiveHashConnect }]>
		paired?: Snippet<[{ hashConnect: PairedReactiveHashConnect }]>
	} = $props()
</script>

{#if !isInitialized(hashConnect)}
	{#if loading}
		{@render loading({ hashConnect })}
	{/if}
{:else if !isPaired(hashConnect)}
	{#if initialized}
		{@render initialized({ hashConnect })}
	{/if}
{:else if paired}
	{@render paired({ hashConnect })}
{/if}
