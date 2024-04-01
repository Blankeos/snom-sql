export function useFrameRate() {
	let before = $state<number>(0);
	let now = $state<number>(0);
	let fps = $state<number>(0);

	$effect(() => {
		before = Date.now();
		fps = 0;
		requestAnimationFrame(function loop() {
			now = Date.now();
			fps = Math.round(1000 / (now - before));
			before = now;
			requestAnimationFrame(loop);
			console.log('looping');
		});
	});

	return {
		get fps() {
			return fps;
		}
	};
}
