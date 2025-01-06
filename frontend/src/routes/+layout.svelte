<script lang="ts">
	import { page } from '$app/state'
	import '../app.css'
	import '$lib/css/colors.css'
	import containerStyles from '$lib/css/container.module.css'

	let { children } = $props()
</script>

<svelte:head>
	<title>{page.data.metadataTitle}</title>
</svelte:head>

<header>
	<nav class={containerStyles.container}>
		<a href="/" class="navigationLink">BIDI</a>
		<a href="/dashboard" class="navigationLink">Dashboard</a>
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

	.navigationLink {
		transition-duration: 100ms;
		transition-property: text-decoration-color;
		transition-timing-function: ease-out;
		color: var(--colorOrange0);
		font-weight: 600;
		text-decoration-line: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 0.15em;
		text-underline-offset: 0.25em;

		@media (hover: hover) {
			&:hover {
				text-decoration-color: var(--colorOrange0);
			}
		}

		@media (hover: none) {
			&:active {
				transition-duration: 20ms;
				text-decoration-color: var(--colorOrange0);
			}
		}
	}
</style>
