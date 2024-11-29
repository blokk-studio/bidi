<script lang="ts">
    import { onMount } from 'svelte';

    interface TokenInfo {
        tokenId: string;
        isDeleted: boolean;
        name?: string;
        symbol?: string;
    }

    let loading = false;
    let error = '';
    let success = '';
    let collections: TokenInfo[] = [];

    // create collection form data
    let collectionName = '';
    let collectionSymbol = '';
    let creatingCollection = false;

    const fetchCollections = async () => {
        const response = await fetch('/api/collection/get');
        if (!response.ok) {
            throw new Error('Failed to fetch collections');
        }
        const data = await response.json();
        return data.collections;
    }

    const createNewCollection = async (name: string, symbol: string) => {
        const response = await fetch('/api/collection/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, symbol })
        });

        if (!response.ok) {
            throw new Error('Failed to create collection');
        }

        return response.json();
    };

    const handleSubmitCollection = async () => {
        try {
            creatingCollection = true;
            error = '';
            success = '';

            if (!collectionName || !collectionSymbol) {
                error = 'Name and symbol are required';
                return;
            }

            const result = await createNewCollection(collectionName, collectionSymbol);
            success = `Collection created successfully! Token ID: ${result.tokenId}`;

            // Reset form
            collectionName = '';
            collectionSymbol = '';

            // Refresh collections
            collections = await fetchCollections();
        } catch (e: any) {
            error = e.message;
        } finally {
            creatingCollection = false;
        }
    };

    const handleDelete = async  (tokenId: string) => {
        if (!confirm('Are you sure you want to delete this collection?')) {
            return;
        }

        try {
            loading = true;
            error = '';

            const response = await fetch(`/api/collection/delete?tokenId=${tokenId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete collection');
            }

            success = `Collection ${tokenId} deleted successfully`;

            // Refresh the collections list
            collections = await fetchCollections();
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    onMount(async () => {
        try {
            loading = true;
            collections = await fetchCollections();
            console.log(collections);
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    });
</script>

<div class="container">
    <h1>NFT Collection</h1>

    <div class="create-form">
        <h2>Create New Collection</h2>

        <form on:submit|preventDefault={handleSubmitCollection}>
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

            <button
                    type="submit"
                    disabled={creatingCollection}
            >
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
                                <button
                                        class="delete-button"
                                        on:click={() => handleDelete(token.tokenId)}
                                >
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

    h1, h2 {
        margin: 0 0 1rem;
    }

    .container {
        font-family: arial, sans-serif;
        padding: 1rem;
    }

    .create-form {
        margin-bottom: 2rem;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
    }

    .form-group input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    button {
        background: #0066cc;
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:disabled {
        background: #cccccc;
        cursor: not-allowed;
    }

    .collections {
        margin-top: 2rem;
    }

    .collection-item {
        padding: 1rem;
        border: 1px solid #ccc;
        margin-bottom: 1rem;
        border-radius: 4px;
    }

    .collection-item p {
        margin: 0 0 6px;
        display: flex;
        align-items: center;
    }

    .token-details {
        font-size: 0.9em;
        color: #666;
        margin-top: 0.25rem;
    }

    .error {
        color: red;
        margin-top: 1rem;
    }

    .success {
        color: green;
        margin-top: 1rem;
    }

    .collection-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .collection-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .view-link {
        color: #0066cc;
        text-decoration: none;
    }

    .delete-button {
        background: #dc3545;
        color: white;
        padding: 0.25rem 0.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .delete-button:hover {
        background: #c82333;
    }

    .collection-item.deleted {
        opacity: 0.7;
        background-color: #f8f8f8;
        border-color: #ddd;
    }

    .deleted-badge {
        background-color: #dc3545;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.8em;
        margin-left: 8px;
    }

    .token-details {
        font-size: 0.9em;
        color: #666;
        margin-top: 0.25rem;
    }

    .collection-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .collection-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .view-link {
        color: #0066cc;
        text-decoration: none;
    }

    .delete-button {
        background: #dc3545;
        color: white;
        padding: 0.25rem 0.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .delete-button:hover {
        background: #c82333;
    }
</style>