<script lang="ts">
	import '../app.css'

	let { children } = $props()
</script>

<header>
	<nav>
		<a data-sveltekit-preload-data="tap" href="/dashboard">dashboard</a>
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

	.layoutContent {
		position: relative;
		background: linear-gradient(to bottom right, #f6d8d5, transparent, #f5f5f5);
		min-height: 100vh;
	}
</style>
