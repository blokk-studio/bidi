<script lang="ts">
	import { page } from '$app/state'
	import '../app.css'

	let { children } = $props()
</script>

<svelte:head>
	<title>{page.data.metadataTitle}</title>
</svelte:head>

<header>
	<nav>
		<a href="/">Landing Page</a>
		<a href="/dashboard">Dashboard</a>
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
		padding: 6px 12px;
		width: 100%;
	}

	nav {
		display: grid;
		grid-template-columns: 1fr auto;
	}

	.layoutContent {
		position: relative;
		background: linear-gradient(to bottom right, #f6d8d5, transparent, #f5f5f5);
		min-height: 100vh;
	}
</style>
