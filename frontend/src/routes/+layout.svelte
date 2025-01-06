<script lang="ts">
	import { page } from '$app/state'
	import '../app.css'
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
		background: #f8f8f8;
		width: 100%;
	}

	nav {
		display: grid;
		grid-template-columns: repeat(2, auto);
		justify-content: space-between;
	}

	.layoutContent {
		position: relative;
		background: linear-gradient(to bottom right, #f6d8d5, transparent, #f5f5f5);
		min-height: 100vh;
	}
</style>
