<script lang="ts">
	let { children } = $props()
</script>

<aside>
	<nav>
		<a href="/dashboard/mint">Create certificate</a>
	</nav>
</aside>

{@render children()}

<style>
	nav {
		margin-inline: max(1rem, 50% - 20rem);
	}

	a {
		display: inline-block;
		padding-inline: 0.25rem;
	}
</style>
