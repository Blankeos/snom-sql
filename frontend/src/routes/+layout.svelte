<script lang="ts">
	import '@/styles/app.css';
	import { theme } from '@/stores/theme';

	$effect(() => {
		// console.log('detected theme change.');
		document.documentElement.dataset.theme = $theme;
	});
</script>

<slot />
