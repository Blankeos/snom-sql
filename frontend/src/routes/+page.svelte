<script lang="ts">
	import IconDatabase from '~icons/ph/database-duotone';
	import Resizable from '@/components/Resizable.svelte';
	import IconSearch from '~icons/ph/magnifying-glass-bold';

	let navWidth = $state('100%');
</script>

<svelte:body class="overflow-hidden" />

<div class="flex h-screen bg-white">
	<Resizable
		directions={{ east: true }}
		minWidth="120px"
		maxWidth="320px"
		bind:width={navWidth}
		handleBarWidth="2px"
	>
		<div class="flex h-full w-full flex-col gap-y-5 overflow-hidden text-center">
			<div class="flex items-center gap-x-2 px-5 py-5">
				<IconDatabase class="flex-shrink-0" />
				<span>Snom SQL</span>
			</div>

			<div class="mx-2 flex flex-col items-start gap-y-2">
				<span class="text-xs text-neutral-500">Database</span>
				<div
					class="flex h-10 w-full items-center gap-x-2 rounded-md bg-neutral-100 px-2 text-neutral-500"
				>
					<IconSearch class="flex-shrink-0" />
					<input class="bg-transparent focus:outline-none" />
				</div>
			</div>

			<div class="mx-2 flex flex-col items-start gap-y-2">
				<span class="text-xs text-neutral-500">Schema</span>
				<button class="btn" onclick={() => (navWidth = '30px')}>Change to 30px | {navWidth}</button>
				<!-- <div
					class="flex h-10 w-full items-center gap-x-2 rounded-md bg-neutral-100 px-2 text-neutral-500"
				>
					<IconSearch class="flex-shrink-0" />
					<input class="bg-transparent focus:outline-none" />
				</div> -->
			</div>
		</div>
	</Resizable>
	<main class="flex flex-1 flex-col">
		<div
			class="grid flex-1 place-items-center overflow-hidden bg-neutral-50 text-sm text-neutral-400"
		>
			🚧 EDITOR WILL BE HERE
			<!--  -->
		</div>
		<Resizable
			class="w-full overflow-hidden"
			height="500px"
			minHeight="20px"
			directions={{ north: true }}
			handleBarWidth="2px"
		>
			<div></div>
		</Resizable>
	</main>
</div>

<!-- <div class="bg-pink-300 h-52">
	<div class="split h-full text-center">
		<div id="split-0" class="flex items-center justify-center p-5" bind:this={split0}>001</div>
		<div id="split-1" class="flex items-center justify-center p-5" bind:this={split1}>001</div>
	</div>
</div>

<style>
	.split {
		display: flex;
		flex-direction: row;
	}
</style> -->
