<script lang="ts">
	import '../app.css'

	let { children } = $props()
</script>

<header>
	<nav>
		<a data-sveltekit-preload-data="tap" href="/dashboard">dashboard</a>
	</nav>
</header>

{@render children()}

<style>
	header {
		background: #f8f8f8;
		padding: 6px 12px;
		position: fixed;
		width: 100%;
		z-index: 9;
	}
</style>