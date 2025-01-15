<script lang="ts">
	import navigationLinkStyles from '$lib/css/navigationLink.module.css'
	import type { BidiCertificate } from '$lib/certificate'
	import Details from 'lucide-svelte/icons/arrow-right'
	import type { Nft } from '$lib/nft'

	let {
		name,
		dateOfWork,
		typeOfWork,
		serialNumber,
	}: Pick<BidiCertificate, 'dateOfWork' | 'typeOfWork'> & Pick<Nft, 'name' | 'serialNumber'> =
		$props()
</script>

<figure class="missionTeaser">
	<h2>{name}</h2>

	<time datetime={dateOfWork}>{new Date(dateOfWork).toLocaleDateString()}</time>

	<p>{typeOfWork}</p>

	<a
		href="/certificates/{serialNumber}"
		class="detailsLink {navigationLinkStyles.navigationLink} {navigationLinkStyles.withIconRight}"
	>
		Details

		<Details aria-hidden="true" />
	</a>
</figure>
