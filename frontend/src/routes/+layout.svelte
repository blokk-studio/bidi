<script lang="ts">
	import { page } from '$app/state'
	import '../reset.css'
	import '$lib/css/colors.css'
	import containerStyles from '$lib/css/container.module.css'
	import navigationLinkStyles from '$lib/css/navigationLink.module.css'

	let { children } = $props()
</script>

<svelte:head>
	<title>{page.data.metadataTitle}</title>
</svelte:head>

<header>
	<nav class={containerStyles.container}>
		<a href="/" class={navigationLinkStyles.navigationLink}>BIDI</a>
		<a href="/dashboard" class={navigationLinkStyles.navigationLink}>Dashboard</a>
	</nav>
</header>

<div class="layoutContent">
	{@render children()}
</div>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 9;
		background-color: white;
		width: 100%;
	}

	nav {
		display: grid;
		grid-template-columns: repeat(2, auto);
		justify-content: space-between;
	}

	.layoutContent {
		position: relative;
		min-height: 100vh;
	}
</style>
