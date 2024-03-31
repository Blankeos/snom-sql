<script lang="ts">
	import Resizable from '@/components/Resizable.svelte';
</script>

<div class="flex">
	<Resizable directions={{ north: true, east: true, south: true, west: true }}>
		<div class="text-center h-full w-full flex justify-center items-center">Pane 1</div>
	</Resizable>
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
