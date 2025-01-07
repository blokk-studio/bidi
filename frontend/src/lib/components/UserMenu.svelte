<script lang="ts">
	import { LedgerId } from '@hashgraph/sdk'
	import OpenMenu from 'lucide-svelte/icons/chevron-down'
	import CloseMenu from 'lucide-svelte/icons/chevron-up'
	import ChevronRight from 'lucide-svelte/icons/chevron-right'
	import Unchecked from 'lucide-svelte/icons/circle'
	import Checked from 'lucide-svelte/icons/circle-check'
	import Disconnect from 'lucide-svelte/icons/log-out'

	import { createDropdownMenu } from '@melt-ui/svelte'
	import { fade, fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { toStore } from 'svelte/store'

	let {
		ledgerId = $bindable(),
		disconnect,
	}: {
		ledgerId: LedgerId
		disconnect: () => void
	} = $props()

	const {
		elements: { trigger, menu, item, separator, arrow },
		builders: { createSubmenu, createMenuRadioGroup },
		states: { open },
	} = createDropdownMenu({
		forceVisible: true,
		loop: true,
	})

	const {
		elements: { subMenu: ledgerIdSubMenu, subTrigger: ledgerIdSubTrigger },
		states: { subOpen: ledgerIdSubOpen },
	} = createSubmenu()

	const {
		elements: { radioGroup: ledgerIdRadioGroup, radioItem: ledgerIdRadioItem },
		helpers: { isChecked: ledgerIdIsChecked },
	} = createMenuRadioGroup({
		defaultValue: ledgerId.toString(),
		value: toStore(
			() => ledgerId.toString(),
			(value) => {
				ledgerId = LedgerId.fromString(value)
			},
		),
	})

	const availableLedgerIdStrings = [LedgerId.MAINNET.toString(), LedgerId.TESTNET.toString()]
</script>

<button type="button" {...$trigger} use:trigger class="trigger">
	{#if $open}
		<CloseMenu aria-label="Hide user options" />
	{:else}
		<OpenMenu aria-label="Show user options" />
	{/if}
</button>

{#if $open}
	<div
		{...$menu}
		use:menu
		transition:fly={{ duration: 100, y: -16, easing: cubicOut }}
		class="menu"
	>
		<!-- svelte-ignore event_directive_deprecated -->
		<div {...$item} use:item on:m-click={disconnect} class="item">
			Disconnect
			<Disconnect aria-hidden="true" />
		</div>

		<div {...$separator} use:separator class="separator"></div>

		<div {...$ledgerIdSubTrigger} use:ledgerIdSubTrigger class="item">
			Switch chain

			<ChevronRight aria-hidden="true" />
		</div>
		{#if $ledgerIdSubOpen}
			<div
				{...$ledgerIdSubMenu}
				use:ledgerIdSubMenu
				transition:fade={{ duration: 100, easing: cubicOut }}
				class="menu"
			>
				<span class="subMenuHeading">Chains</span>

				<div {...$ledgerIdRadioGroup} use:ledgerIdRadioGroup>
					{#each availableLedgerIdStrings as ledgerIdString}
						<div
							{...$ledgerIdRadioItem({ value: ledgerIdString })}
							use:ledgerIdRadioItem
							class="item radioItem"
						>
							{#if $ledgerIdIsChecked(ledgerIdString)}
								<Checked aria-hidden="true" />
							{:else}
								<Unchecked aria-hidden="true" />
							{/if}

							{ledgerIdString}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div {...$arrow} use:arrow></div>
	</div>
{/if}

<style>
	.trigger {
		transition-duration: 50ms;
		transition-property: color;
		transition-timing-function: linear;
		cursor: pointer;
		padding: 0.75rem;
		color: var(--colorOrange0);

		@media (hover: hover) {
			&:hover {
				color: inherit;
			}
		}

		@media (hover: none) {
			&:active {
				transition-duration: 20ms;
				color: inherit;
			}
		}
	}

	.menu {
		display: grid;
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
		border-radius: 0.5rem;
		background-color: white;
		padding-top: 0.25rem;
		padding-bottom: 0.5rem;
	}

	.subMenuHeading {
		padding-inline: 1.5rem;
		padding-top: 0.75rem;
		padding-bottom: 0.25rem;
		color: var(--colorGreen0);
		font-weight: 600;
	}

	.item {
		display: grid;
		grid-template-columns: 1fr max-content;
		column-gap: 0.5rem;
		justify-content: space-between;
		transition-duration: 50ms;
		transition-property: color;
		transition-timing-function: linear;
		cursor: pointer;
		padding-inline: 1.5rem;
		padding-block: 0.75rem;

		&[data-state='open'] {
			color: var(--colorOrange0);
		}

		@media (hover: hover) {
			&:hover {
				color: var(--colorOrange0);
			}
		}

		@media (hover: none) {
			&:active {
				transition-duration: 20ms;
				color: var(--colorOrange0);
			}
		}
	}

	.radioItem {
		grid-template-columns: max-content 1fr;
	}
</style>
