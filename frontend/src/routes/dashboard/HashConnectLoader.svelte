<script lang="ts" module>
	type UninitializedReactiveHashConnect = Pick<ReactiveHashConnect, 'selectedLedgerId'>

	type InitializedReactiveHashConnect = Omit<ReactiveHashConnect, 'connect'> &
		Pick<Required<ReactiveHashConnect>, 'connect'>

	const isInitialized = (
		reactiveHashConnect: ReactiveHashConnect,
	): reactiveHashConnect is InitializedReactiveHashConnect => {
		return !!reactiveHashConnect.connect
	}

	type PairedReactiveHashConnect = Omit<ReactiveHashConnect, 'connect' | 'session'> &
		Pick<Required<ReactiveHashConnect>, 'connect' | 'session'>
	const isPaired = (
		reactiveHashConnect: ReactiveHashConnect,
	): reactiveHashConnect is PairedReactiveHashConnect => {
		return !!reactiveHashConnect.connect && !!reactiveHashConnect.session
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte'
	import { hashConnect, type ReactiveHashConnect } from '../../lib/hashconnect/hashConnect.svelte'

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
