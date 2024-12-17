<script lang="ts">
    export let data;
</script>

<figure class="nft-card">
    <img src="/0.png" alt="">
    <button class="claim-button">
        <span class="index-number">#{data?.serialNumber}</span>
        <span class="claim-text">Claim</span>
    </button>
</figure>

<style>
    .nft-card {
        background-color: white;
        border-radius: 1rem;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        justify-self: center;
        padding-bottom: 2rem;
        position: relative;
        width: 100%;
    }

    .nft-card img {
        border-radius: 1rem;
        height: fit-content;
        width: fit-content;
    }

    .claim-button {
        background-color: rgb(253 242 248); /* pink-50 */
        border-radius: 0.75rem;
        bottom: 10px;
        cursor: pointer;
        font-size: 0.875rem;
        height: 40px;
        overflow: hidden;
        padding: 0.5rem;
        position: absolute;
        right: 10px;
        text-align: right;
        text-transform: uppercase;
        transition: background-color 0.2s ease-in-out;
        width: 102px;
    }

    .claim-button:hover {
        background-color: rgb(239 246 255); /* blue-50 */
    }

    .index-number {
        padding: 0.5rem;
        position: absolute;
        right: 0;
        top: 0;
        transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;
    }

    .claim-button:hover .index-number {
        opacity: 0;
        transform: translateY(-40px);
    }

    .claim-text {
        align-items: center;
        display: flex;
        font-size: 0.75rem;
        font-weight: bold;
        height: 100%;
        opacity: 0;
        padding: 0.5rem;
        position: absolute;
        right: 0;
        top: 100%;
        transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;
    }

    .claim-button:hover .claim-text {
        opacity: 1;
        transform: translateY(-40px);
    }
</style>
