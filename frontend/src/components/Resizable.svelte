<script lang="ts">
	// ===========================================================================
	// Utilities 1: Converting string (CSS-Sizes) or Number(Pixels) to string (CSS-Sizes).
	// ===========================================================================
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

	// ===========================================================================
	// Utilities 2: Converting string (CSS-Sizes) to Number (pixels).
	//
	// Note: I know it looks like Utilities 1 is the "yin and yang" of
	// Utilities 2, but no, they don't bidrectionally convert each other.
	// ===========================================================================
	function percentWToPixels(percentage: number, parentElement: any) {
		// If the parent is the viewport, use window dimensions
		if (parentElement === window) {
			return (percentage / 100) * window.innerWidth; // For width
		} else {
			// Calculate based on the parent element's dimensions
			return (percentage / 100) * parentElement.offsetWidth; // For width
		}
	}

	function percentHToPixels(percentage: number, parentElement: any) {
		// If the parent is the viewport, use window dimensions
		if (parentElement === window) {
			return (percentage / 100) * window.innerHeight; // For height
		} else {
			// Calculate based on the parent element's dimensions
			return (percentage / 100) * parentElement.offsetHeight; // For height
		}
	}

	function vhToPixels(vh: number) {
		return (vh / 100) * window.innerHeight;
	}

	function vwToPixels(vw: number) {
		return (vw / 100) * window.innerWidth;
	}

	const getWidthPixelSize = (n: number | string): number | undefined => {
		if (typeof n === 'number') return n;

		n = n.toString();
		if (n === 'auto') {
			return undefined;
		}
		if (n.endsWith('px')) {
			return parseFloat(n.replace('px', ''));
		}
		if (n.endsWith('%')) {
			return percentWToPixels(parseFloat(n.replace('%', '')), splitPaneRef?.parentNode ?? window);
		}
		if (n.endsWith('vh')) {
			return vhToPixels(parseFloat(n.replace('vh', '')));
		}
		if (n.endsWith('vw')) {
			return vwToPixels(parseFloat(n.replace('vw', '')));
		}
		// if (n.endsWith('vmax')) {
		// 	return n;
		// }
		// if (n.endsWith('vmin')) {
		// 	return n;
		// }
	};

	const getHeightPixelSize = (n: number | string): number | undefined => {
		if (typeof n === 'number') return n;

		n = n.toString();
		if (n === 'auto') {
			return undefined;
		}
		if (n.endsWith('px')) {
			return parseFloat(n.replace('px', ''));
		}
		if (n.endsWith('%')) {
			return percentHToPixels(parseFloat(n.replace('%', '')), splitPaneRef?.parentNode ?? window);
		}
		if (n.endsWith('vh')) {
			return vhToPixels(parseFloat(n.replace('vh', '')));
		}
		if (n.endsWith('vw')) {
			return vwToPixels(parseFloat(n.replace('vw', '')));
		}
		// if (n.endsWith('vmax')) {
		// 	return n;
		// }
		// if (n.endsWith('vmin')) {
		// 	return n;
		// }
	};

	import { type Snippet } from 'svelte';
	import type { Action } from 'svelte/action';
	import { spring, type SpringOpts } from 'svelte/motion';

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

		/**
		 * We use spring to make the resize animation smooth.
		 * If you want a snaipper look (laggy), try `{ precision: 2 }`.
		 * @defaultValue `{ precision: 0.8 }`.
		 */
		springOptions?: SpringOpts;

		/**
		 * Specify the draggable directions.
		 * false - disable all directions.
		 * true - enable all directions.
		 * object - enable specific directions.
		 * @defaultValue false
		 */
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

	// ===========================================================================
	// Instances
	// ===========================================================================
	let splitPaneRef: HTMLDivElement;

	// ===========================================================================
	// States
	// ===========================================================================
	let dragging = $state(false);
	let draggingDirection = $state<'north' | 'west' | 'east' | 'south' | null>(null);

	let currentWidth = spring<number | undefined>(getWidthPixelSize(width), { precision: 0.8 });
	let currentHeight = spring<number | undefined>(getHeightPixelSize(height), { precision: 0.8 });

	// ===========================================================================
	// Derived States
	// ===========================================================================
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

	function setHeightNorth(this: Window, ev: MouseEvent) {
		draggingDirection = 'north';
		const rect = splitPaneRef.getBoundingClientRect();
		const newHeight = rect.bottom - ev.clientY;
		height = newHeight;
	}

	function setHeightSouth(this: Window, ev: MouseEvent) {
		draggingDirection = 'south';
		const rect = splitPaneRef.getBoundingClientRect();
		const newHeight = ev.clientY - rect.top;
		height = newHeight;
	}

	function setWidthEast(this: Window, ev: MouseEvent) {
		draggingDirection = 'east';
		const rect = splitPaneRef.getBoundingClientRect();
		const newWidth = ev.clientX - rect.left;
		width = newWidth;
	}

	function setWidthWest(this: Window, ev: MouseEvent) {
		draggingDirection = 'west';
		const rect = splitPaneRef.getBoundingClientRect();
		const newWidth = rect.right - ev.clientX;
		width = newWidth;
	}

	// ===========================================================================
	// Actions
	// ===========================================================================
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

	// These spring values are derived from the width and height bindable states.
	$effect(() => {
		if (width === 'auto') {
			// So it doesn't interpolate from number to undefined
			currentWidth.set(undefined, { hard: true });
		} else {
			$currentWidth = getWidthPixelSize(width);
		}

		if (height === 'auto') {
			// So it doesn't interpolate from number to undefined
			currentHeight.set(undefined, { hard: true });
		} else {
			$currentHeight = getHeightPixelSize(height);
		}
		// console.log({ width, height, currentWidth: $currentWidth, currentHeight: $currentHeight });
	});
</script>

<!-- // 	style:width={currentWidth ? `${$currentWidth}px` : undefined}
// style:height={currentHeight ? `${$currentHeight}px` : undefined} -->
<div
	class={className}
	bind:this={splitPaneRef}
	style="position: relative; will-change: 'height', 'width';"
	style:width={$currentWidth ? `${$currentWidth}px` : undefined}
	style:height={$currentHeight ? `${$currentHeight}px` : undefined}
	style:min-height={minHeight}
	style:max-height={maxHeight}
	style:min-width={minWidth}
	style:max-width={maxWidth}
>
	{$currentWidth} x {$currentHeight}
	<!-- North Handle -->
	{#if _directions.north}
		<div
			style="position: absolute; left: 0px; right: 0px; top: 0px;"
			style:height={getStringSize(handleWidth)}
			class="bg-gray-200 hover:cursor-ns-resize"
			use:dragAction={setHeightNorth}
		/>
	{/if}
	<!-- South Handle -->
	{#if _directions.south}
		<div
			style="position: absolute; left: 0px; right: 0px; bottom: 0px;"
			style:height={getStringSize(handleWidth)}
			class="bg-gray-200 hover:cursor-ns-resize"
			use:dragAction={setHeightSouth}
		/>
	{/if}
	<!-- East Handle -->
	{#if _directions.east}
		<div
			style="position: absolute; right: 0px; top: 0px; bottom: 0px;"
			style:width={getStringSize(handleWidth)}
			class="bg-gray-200 hover:cursor-ew-resize"
			use:dragAction={setWidthEast}
		/>
	{/if}
	<!-- West Handle -->
	{#if _directions.west}
		<div
			style="position: absolute; left: 0px; top: 0px; bottom: 0px;"
			style:width={getStringSize(handleWidth)}
			class="bg-gray-200 hover:cursor-ew-resize"
			use:dragAction={setWidthWest}
		/>
	{/if}
	{@render children()}
</div>
