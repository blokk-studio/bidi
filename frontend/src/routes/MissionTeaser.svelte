<script lang="ts">
	import navigationLinkStyles from '$lib/css/navigationLink.module.css'
	import Details from 'lucide-svelte/icons/arrow-right'
	import MultilineText from '$lib/components/MultilineText.svelte'

	let {
		title,
		dateOfWork,
		typeOfWork,
		route,
	}: {
		title: string
		dateOfWork: string
		typeOfWork: string
		route: string
	} = $props()
</script>

<figure class="missionTeaser">
	<h2>{title}</h2>

	<time datetime={dateOfWork}>{new Date(dateOfWork).toLocaleDateString()}</time>

	{#if typeOfWork}
		<p>
			<MultilineText text={typeOfWork} />
		</p>
	{/if}

	<a
		href={route}
		class="detailsLink {navigationLinkStyles.navigationLink} {navigationLinkStyles.withIconRight}"
	>
		Details

		<Details aria-hidden="true" />
	</a>
</figure>
