<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
</script>

<button
	onclick={toggleMode}
	class="relative inline-flex items-center justify-center border border-border p-2 hover:bg-input/50"
>
	<Sun class="size-5 scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90" />
	<Moon class="absolute size-5 scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0" />
	<span class="sr-only">Toggle theme</span>
</button>
