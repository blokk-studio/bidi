<script lang="ts">
	let { children } = $props()
</script>

<header>
	<nav>
		<a data-sveltekit-preload-data="tap" href="/dashboard">dashboard</a>
	</nav>
</header>

{@render children()}
