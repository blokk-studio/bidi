<script lang="ts">
	import { hashConnect as hashConnect } from '$lib/hashconnect/hashConnect.svelte'
	import { getCollections, type TokenInfo } from '$lib/hedera/collection/get'

	let loading = $state(false)
	let error = $state('')
	let success = $state('')
	let collections: TokenInfo[] = $state([])

	// create collection form data
	let collectionName = $state('')
	let collectionSymbol = $state('')
	let creatingCollection = $state(false)

	const fetchCollections = async () => {
		if (!hashConnect.session) {
			return []
		}

		const collections = await getCollections({
			ledgerId: hashConnect.session.ledgerId,
			accountId: hashConnect.session.accountId,
		})

		return collections
	}

	const createNewCollection = async (name: string, symbol: string) => {
		const response = await fetch('/api/collection/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name, symbol }),
		})

		if (!response.ok) {
			throw new Error('Failed to create collection')
		}

		return response.json()
	}

	const handleSubmitCollection = async () => {
		try {
			creatingCollection = true
			error = ''
			success = ''

			if (!collectionName || !collectionSymbol) {
				error = 'Name and symbol are required'
				return
			}

			const result = await createNewCollection(collectionName, collectionSymbol)
			success = `Collection created successfully! Token ID: ${result.tokenId}`

			// Reset form
			collectionName = ''
			collectionSymbol = ''

			// Refresh collections
			collections = await fetchCollections()
		} catch (throwable) {
			error = throwable instanceof Error ? throwable.message : String(throwable)
		} finally {
			creatingCollection = false
		}
	}

	const handleDelete = async (tokenId: string) => {
		if (!confirm('Are you sure you want to delete this collection?')) {
			return
		}

		try {
			loading = true
			error = ''

			const response = await fetch(`/api/collection/delete?tokenId=${tokenId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error('Failed to delete collection')
			}

			success = `Collection ${tokenId} deleted successfully`

			// Refresh the collections list
			collections = await fetchCollections()
		} catch (throwable) {
			error = throwable instanceof Error ? throwable.message : String(throwable)
		} finally {
			loading = false
		}
	}

	$effect(() => {
		loading = true
		fetchCollections()
			.then((tokenInfos) => {
				collections = tokenInfos
			})
			.catch((throwable) => {
				error = throwable instanceof Error ? throwable.message : String(throwable)
			})
			.finally(() => {
				loading = false
			})
	})
</script>

<div class="container">
	<h1>NFT Collection</h1>

	<div class="create-form">
		<h2>Create New Collection</h2>

		<form
			onsubmit={(event) => {
				event.preventDefault()

				handleSubmitCollection()
			}}
		>
			<div class="form-group">
				<label for="name">Collection Name:</label>
				<input
					type="text"
					id="name"
					bind:value={collectionName}
					placeholder="My NFT Collection"
					disabled={creatingCollection}
					required
				/>
			</div>

			<div class="form-group">
				<label for="symbol">Collection Symbol:</label>
				<input
					type="text"
					id="symbol"
					bind:value={collectionSymbol}
					placeholder="NFT"
					disabled={creatingCollection}
					required
				/>
			</div>

			<button type="submit" disabled={creatingCollection}>
				{creatingCollection ? 'Creating...' : 'Create Collection'}
			</button>
		</form>
	</div>

	{#if loading}
		<p>Loading collections...</p>
	{:else if collections.length > 0}
		<div class="collections">
			<h2>Your Collections</h2>
			{#each collections as token}
				<div class="collection-item {token.isDeleted ? 'deleted' : ''}">
					<div class="collection-info">
						<div>
							<p>
								{token.tokenId}
								{#if token.isDeleted}
									<span class="deleted-badge">Deleted</span>
								{/if}
							</p>
							{#if token.name && token.symbol}
								<p class="token-details">{token.name} ({token.symbol})</p>
							{/if}
						</div>
						<div class="collection-actions">
							<a
								href={`https://hashscan.io/testnet/token/${token.tokenId}`}
								target="_blank"
								rel="noopener noreferrer"
								class="view-link"
							>
								View on HashScan
							</a>
							{#if !token.isDeleted}
								<button class="delete-button" onclick={() => handleDelete(token.tokenId)}>
									Delete
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p>No collections found</p>
	{/if}

	{#if error}
		<p class="error">{error}</p>
	{/if}

	{#if success}
		<p class="success">{success}</p>
	{/if}
</div>

<style>
	* {
		box-sizing: border-box;
	}

	h1,
	h2 {
		margin: 0 0 1rem;
	}

	.container {
		padding: 1rem;
		font-family: arial, sans-serif;
	}

	.create-form {
		margin-bottom: 2rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 1rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
	}

	.form-group input {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0.5rem;
		width: 100%;
	}

	button {
		cursor: pointer;
		border: none;
		border-radius: 4px;
		background: #0066cc;
		padding: 0.5rem 1rem;
		color: white;
	}

	button:disabled {
		cursor: not-allowed;
		background: #cccccc;
	}

	.collections {
		margin-top: 2rem;
	}

	.collection-item {
		margin-bottom: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 1rem;
	}

	.collection-item p {
		display: flex;
		align-items: center;
		margin: 0 0 6px;
	}

	.token-details {
		margin-top: 0.25rem;
		color: #666;
		font-size: 0.9em;
	}

	.error {
		margin-top: 1rem;
		color: red;
	}

	.success {
		margin-top: 1rem;
		color: green;
	}

	.collection-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.collection-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.view-link {
		color: #0066cc;
		text-decoration: none;
	}

	.delete-button {
		cursor: pointer;
		border: none;
		border-radius: 4px;
		background: #dc3545;
		padding: 0.25rem 0.5rem;
		color: white;
	}

	.delete-button:hover {
		background: #c82333;
	}

	.collection-item.deleted {
		opacity: 0.7;
		border-color: #ddd;
		background-color: #f8f8f8;
	}

	.deleted-badge {
		margin-left: 8px;
		border-radius: 4px;
		background-color: #dc3545;
		padding: 2px 6px;
		color: white;
		font-size: 0.8em;
	}

	.token-details {
		margin-top: 0.25rem;
		color: #666;
		font-size: 0.9em;
	}

	.collection-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.collection-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.view-link {
		color: #0066cc;
		text-decoration: none;
	}

	.delete-button {
		cursor: pointer;
		border: none;
		border-radius: 4px;
		background: #dc3545;
		padding: 0.25rem 0.5rem;
		color: white;
	}

	.delete-button:hover {
		background: #c82333;
	}
</style>
