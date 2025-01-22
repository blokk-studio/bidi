<script lang="ts">
	import type { Snippet } from 'svelte'
	import {
		hashConnect,
		isInitialized,
		isPaired,
		type InitializedReactiveHashConnect,
		type PairedReactiveHashConnect,
		type UninitializedReactiveHashConnect,
		type ReactiveHashConnectWithAccountInformation,
		isWithAccountInformation,
	} from './hashConnect.svelte'

	let {
		loading,
		initialized,
		paired,
		withAccountInformation = paired,
	}: {
		loading?: Snippet<[{ hashConnect: UninitializedReactiveHashConnect }]>
		initialized?: Snippet<[{ hashConnect: InitializedReactiveHashConnect }]>
		paired?: Snippet<[{ hashConnect: PairedReactiveHashConnect }]>
		withAccountInformation?: Snippet<[{ hashConnect: ReactiveHashConnectWithAccountInformation }]>
	} = $props()
</script>

<div aria-live="polite" aria-busy={!hashConnect.connect}>
	{#if !isInitialized(hashConnect)}
		{#if loading}
			{@render loading({ hashConnect })}
		{/if}
	{:else if !isPaired(hashConnect)}
		{#if initialized}
			{@render initialized({ hashConnect })}
		{/if}
	{:else if !isWithAccountInformation(hashConnect)}
		{#if paired}
			{@render paired({ hashConnect })}
		{/if}
	{:else if withAccountInformation}
		{@render withAccountInformation({ hashConnect })}
	{/if}
</div>
