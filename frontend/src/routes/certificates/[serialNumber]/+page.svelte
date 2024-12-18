<script lang="ts">
	import containerStyles from '$lib/css/container.module.css'

	let { data } = $props()
</script>

<main class={containerStyles.container}>
	<h1>{data.nft.name} #{data.nft.serialNumber}</h1>

	<img src={data.nft.imageUrl} alt="Image of certificate #{data.nft.serialNumber}" />

	<p>{new Date(data.nft.certificate.dateOfWork).toLocaleDateString()}</p>
	<p>{data.nft.certificate.swissGridE} / {data.nft.certificate.swissGridN}</p>
	<p>{data.nft.certificate.operationsManager}</p>
	<p>{data.nft.certificate.typeOfNaturalObject}</p>
	<p>{data.nft.certificate.typeOfWork}</p>
	<p>{data.nft.certificate.effectOnBiodiversity}</p>
</main>

<style>
	h1 {
		padding-top: 3rem;
	}

	img {
		margin-top: 1rem;
	}
</style>
