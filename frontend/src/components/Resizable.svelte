<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Action } from 'svelte/action';
	import { spring } from 'svelte/motion';

	type Props = {
		children: Snippet;
		minHeight?: string;
		minWidth?: string;
		gutterWidth?: string;
		/** @defaultValue false */
		directions?:
			| boolean
			| {
					north?: boolean;
					west?: boolean;
					east?: boolean;
					south?: boolean;
			  };
	};

	let { children, gutterWidth = '2px', directions: enable = false }: Props = $props();

	let _directions = $derived.by(() => {
		if (enable === true)
			return {
				north: true,
				west: true,
				east: true,
				south: true
			};

		if (enable === false)
			return {
				north: false,
				west: false,
				east: false,
				south: false
			};

		return {
			north: enable.north ?? false,
			west: enable.west ?? false,
			east: enable.east ?? false,
			south: enable.south ?? false
		};
	});

	let dragging = $state(false);

	let currentWidth = spring(500, { precision: 1, stiffness: 1 });
	let currentHeight = spring(500, { precision: 1, stiffness: 1 });

	let splitPaneRef: HTMLDivElement;

	function setHeightNorth(this: Window, ev: MouseEvent) {
		const rect = splitPaneRef.getBoundingClientRect();
		const height = rect.bottom - ev.clientY;
		$currentHeight = height;
	}

	function setHeightSouth(this: Window, ev: MouseEvent) {
		const rect = splitPaneRef.getBoundingClientRect();
		const height = ev.clientY - rect.top;
		$currentHeight = height;
	}

	function setWidthEast(this: Window, ev: MouseEvent) {
		const rect = splitPaneRef.getBoundingClientRect();
		const width = ev.clientX - rect.left;
		$currentWidth = width;
	}

	function setWidthWest(this: Window, ev: MouseEvent) {
		const rect = splitPaneRef.getBoundingClientRect();
		const width = rect.right - ev.clientX;
		$currentWidth = width;
	}

	const dragAction: Action<HTMLElement, (this: Window, ev: MouseEvent) => any> = (
		node,
		callback
	) => {
		const mousedown = (event: MouseEvent & { which: number }) => {
			if (event.which !== 1) return;

			event.preventDefault();

			dragging = true;

			const onmouseup = () => {
				dragging = false;

				window.removeEventListener('mousemove', callback, false);
				window.removeEventListener('mouseup', onmouseup, false);
			};

			window.addEventListener('mousemove', callback, false);
			window.addEventListener('mouseup', onmouseup, false);
		};

		node.addEventListener('mousedown', mousedown, false);

		return {
			destroy() {
				/** @ts-ignore */
				node.removeEventListener('mousedown', onmousedown, false);
			}
		};
	};

	// import { clamp } from '@/lib/utils/clamp';
	// import { createEventDispatcher } from 'svelte';

	// const dispatch = createEventDispatcher();

	// export let orientation: 'vertical' | 'horizontal' = 'horizontal';
	// export let pos = 50;
	// export let fixed = false;
	// export let min = 50;

	// const refs: any = {};

	// let dragging = false;

	// function setPos(event: MouseEvent & { clientY: number; clientX: number }) {
	// 	const { top, bottom, left, right } = refs.container.getBoundingClientRect();

	// 	const extents = orientation === 'vertical' ? [top, bottom] : [left, right];

	// 	const px = clamp(
	// 		orientation === 'vertical' ? event.clientY : event.clientX,
	// 		extents[0] + min,
	// 		extents[1] - min
	// 	);

	// 	pos = (100 * (px - extents[0])) / (extents[1] - extents[0]);

	// 	dispatch('change');
	// }

	// function drag(node: HTMLElement, callback: (event: MouseEvent) => void) {
	// 	const mousedown = (event: MouseEvent & { which: number }) => {
	// 		if (event.which !== 1) return;

	// 		event.preventDefault();

	// 		dragging = true;

	// 		const onmouseup = () => {
	// 			dragging = false;

	// 			window.removeEventListener('mousemove', callback, false);
	// 			window.removeEventListener('mouseup', onmouseup, false);
	// 		};

	// 		window.addEventListener('mousemove', callback, false);
	// 		window.addEventListener('mouseup', onmouseup, false);
	// 	};

	// 	node.addEventListener('mousedown', mousedown, false);

	// 	return {
	// 		destroy() {
	// 			/** @ts-ignore */
	// 			node.removeEventListener('mousedown', onmousedown, false);
	// 		}
	// 	};
	// }

	// $: side = orientation === 'horizontal' ? 'left' : 'top';
	// $: dimension = orientation === 'horizontal' ? 'width' : 'height';
</script>

<div
	bind:this={splitPaneRef}
	style="position: relative; will-change: 'height', 'width';"
	style:width={`${$currentWidth}px`}
	style:height={`${$currentHeight}px`}
>
	<!-- North Handle -->
	{#if _directions.north}
		<div
			style="position: absolute; left: 0px; right: 0px; top: 0px;"
			style:height={gutterWidth}
			class="bg-gray-500 cursor-ns-resize active:cursor-ns-resize"
			use:dragAction={setHeightNorth}
		/>
	{/if}
	<!-- South Handle -->
	{#if _directions.south}
		<div
			style="position: absolute; left: 0px; right: 0px; bottom: 0px;"
			style:height={gutterWidth}
			class="bg-gray-500 cursor-ns-resize active:cursor-ns-resize"
			use:dragAction={setHeightSouth}
		/>
	{/if}
	<!-- East Handle -->
	{#if _directions.east}
		<div
			style="position: absolute; right: 0px; top: 0px; bottom: 0px;"
			style:width={gutterWidth}
			class="bg-gray-500 cursor-ew-resize"
			use:dragAction={setWidthEast}
		/>
	{/if}
	<!-- West Handle -->
	{#if _directions.west}
		<div
			style="position: absolute; left: 0px; top: 0px; bottom: 0px;"
			style:width={gutterWidth}
			class="bg-gray-500 cursor-ew-resize"
			use:dragAction={setWidthWest}
		/>
	{/if}
	{@render children()}
</div>

<!-- <div class="container" bind:this={refs.container}>
	<div class="pane" style="{dimension}: {pos}%;">
		<slot name="a" />
	</div>

	<div class="pane" style="{dimension}: {100 - pos}%;">
		<slot name="b" />
	</div>

	{#if !fixed}
		<div class="{orientation} divider" style="{side}: calc({pos}% - 8px)" use:drag={setPos}></div>
	{/if}
</div>

{#if dragging}
	<div class="mousecatcher"></div>
{/if} -->

<!-- <style>
	.container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.pane {
		position: relative;
		float: left;
		width: 100%;
		height: 100%;
	}

	.mousecatcher {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.01);
	}

	.divider {
		position: absolute;
		z-index: 10;
		display: none;
	}

	.divider::after {
		content: '';
		position: absolute;
		/* background-color: #eee; */
		background-color: var(--second);
	}

	.horizontal {
		padding: 0 8px;
		width: 0;
		height: 100%;
		cursor: ew-resize;
	}

	.horizontal::after {
		left: 8px;
		top: 0;
		width: 1px;
		height: 100%;
	}

	.vertical {
		padding: 8px 0;
		width: 100%;
		height: 0;
		cursor: ns-resize;
	}

	.vertical::after {
		top: 8px;
		left: 0;
		width: 100%;
		height: 1px;
	}

	.left,
	.right,
	.divider {
		display: block;
	}

	.left,
	.right {
		height: 100%;
		float: left;
	}

	.top,
	.bottom {
		position: absolute;
		width: 100%;
	}

	.top {
		top: 0;
	}
	.bottom {
		bottom: 0;
	}
</style> -->
