<script lang="ts">
	const getStringSize = (n: number | string): string => {
		n = n.toString();
		if (n === 'auto') {
			return n;
		}
		if (n.endsWith('px')) {
			return n;
		}
		if (n.endsWith('%')) {
			return n;
		}
		if (n.endsWith('vh')) {
			return n;
		}
		if (n.endsWith('vw')) {
			return n;
		}
		if (n.endsWith('vmax')) {
			return n;
		}
		if (n.endsWith('vmin')) {
			return n;
		}
		return `${n}px`;
	};

	import { type Snippet } from 'svelte';
	import type { Action } from 'svelte/action';
	import { spring } from 'svelte/motion';

	type Props = {
		class?: string;

		children: Snippet;

		/** @defaultValue 'auto'. */
		width?: number | string;
		/** @defaultValue 'auto'. */
		height?: number | string;

		/** @defaultValue undefined. */
		minHeight?: number | string;
		/** @defaultValue undefined. */
		maxHeight?: number | string;
		/** @defaultValue undefined. */
		minWidth?: number | string;
		/** @defaultValue undefined. */
		maxWidth?: number | string;

		/** Width of the handlebar. @defaultValue "4px" */
		handleBarWidth?: number | string;
		/** @defaultValue false */
		directions?:
			| boolean
			| {
					north?: boolean;
					west?: boolean;
					east?: boolean;
					south?: boolean;
					/** WIP: */
					northwest?: boolean;
					/** WIP: */
					northeast?: boolean;
					/** WIP: */
					southwest?: boolean;
					/** WIP: */
					southeast?: boolean;
			  };
	};

	let {
		children,
		width = $bindable<number | string>('auto'),
		height = $bindable<number | string>('auto'),
		minHeight,
		maxHeight,
		minWidth,
		maxWidth,
		class: className,
		handleBarWidth: handleWidth = '4px',
		directions: enable = false
	}: Props = $props();

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
	let draggingDirection = $state<'north' | 'west' | 'east' | 'south' | null>(null);

	let currentWidth = spring<number | undefined>(undefined, { precision: 0.8 });
	let currentHeight = spring<number | undefined>(undefined, { precision: 0.8 });

	let splitPaneRef: HTMLDivElement;

	function setHeightNorth(this: Window, ev: MouseEvent) {
		draggingDirection = 'north';
		const rect = splitPaneRef.getBoundingClientRect();
		const height = rect.bottom - ev.clientY;
		$currentHeight = height;
	}

	function setHeightSouth(this: Window, ev: MouseEvent) {
		draggingDirection = 'south';
		const rect = splitPaneRef.getBoundingClientRect();
		const height = ev.clientY - rect.top;
		$currentHeight = height;
	}

	function setWidthEast(this: Window, ev: MouseEvent) {
		draggingDirection = 'east';
		const rect = splitPaneRef.getBoundingClientRect();
		const width = ev.clientX - rect.left;
		$currentWidth = width;
	}

	function setWidthWest(this: Window, ev: MouseEvent) {
		draggingDirection = 'west';
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
				draggingDirection = null;

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

	$effect(() => {
		switch (draggingDirection) {
			case 'east':
			case 'west':
				document.body.style.cursor = 'ew-resize';
				break;
			case 'north':
			case 'south':
				document.body.style.cursor = 'ns-resize';
				break;
			case null:
				document.body.style.cursor = 'auto';
		}
	});

	let _width = $derived(getStringSize($currentWidth ?? width));
	let _height = $derived(getStringSize($currentHeight ?? height));
</script>

<!-- // 	style:width={currentWidth ? `${$currentWidth}px` : undefined}
// style:height={currentHeight ? `${$currentHeight}px` : undefined} -->
<div
	class={className}
	bind:this={splitPaneRef}
	style="position: relative; will-change: 'height', 'width';"
	style:width={_width}
	style:height={_height}
	style:min-height={minHeight}
	style:max-height={maxHeight}
	style:min-width={minWidth}
	style:max-width={maxWidth}
>
	<!-- North Handle -->
	{#if _directions.north}
		<div
			style="position: absolute; left: 0px; right: 0px; top: 0px;"
			style:height={handleWidth}
			class="bg-gray-200 hover:cursor-ns-resize"
			use:dragAction={setHeightNorth}
		/>
	{/if}
	<!-- South Handle -->
	{#if _directions.south}
		<div
			style="position: absolute; left: 0px; right: 0px; bottom: 0px;"
			style:height={handleWidth}
			class="bg-gray-200 hover:cursor-ns-resize"
			use:dragAction={setHeightSouth}
		/>
	{/if}
	<!-- East Handle -->
	{#if _directions.east}
		<div
			style="position: absolute; right: 0px; top: 0px; bottom: 0px;"
			style:width={handleWidth}
			class="bg-gray-200 hover:cursor-ew-resize"
			use:dragAction={setWidthEast}
		/>
	{/if}
	<!-- West Handle -->
	{#if _directions.west}
		<div
			style="position: absolute; left: 0px; top: 0px; bottom: 0px;"
			style:width={handleWidth}
			class="bg-gray-200 hover:cursor-ew-resize"
			use:dragAction={setWidthWest}
		/>
	{/if}
	{@render children()}
</div>
