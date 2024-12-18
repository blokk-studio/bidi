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

<div aria-live="polite" aria-busy={!hashConnect.connect}>
	{#if !isInitialized(hashConnect)}
		{#if loading}
			{@render loading({ hashConnect })}
		{:else}
			<p>Waiting for HashPack...</p>
		{/if}
	{:else if !isPaired(hashConnect)}
		{#if initialized}
			{@render initialized({ hashConnect })}
		{:else}
			<p>Please connect your wallet using the button at the top of the page.</p>
		{/if}
	{:else if paired}
		{@render paired({ hashConnect })}
	{/if}
</div>
