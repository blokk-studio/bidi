<script lang="ts" module>
	type InitializedReactiveHashConnect = Omit<ReactiveHashConnect, 'connect'> &
		Pick<Required<ReactiveHashConnect>, 'connect'>

	const isInitialized = (
		reactiveHashConnect: ReactiveHashConnect,
	): reactiveHashConnect is InitializedReactiveHashConnect => {
		return !!reactiveHashConnect.connect
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte'
	import { hashConnect, type ReactiveHashConnect } from '../../lib/hashconnect/hashConnect.svelte'

	let {
		children,
	}: {
		children: Snippet<
			[
				{
					hashConnect: InitializedReactiveHashConnect
				},
			]
		>
	} = $props()
</script>

{#if !isInitialized(hashConnect)}
	<span>Loading HashConnect</span>
{:else}
	{@render children({ hashConnect })}
{/if}
