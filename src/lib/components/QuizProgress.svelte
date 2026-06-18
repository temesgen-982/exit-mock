<script lang="ts">
	let { progressWidth }: { progressWidth: number } = $props();
</script>

<div class="h-1 flex-none bg-muted">
	<div
		class="h-full bg-primary transition-all duration-500"
		style="width: {progressWidth}%"
		role="progressbar"
		aria-valuenow={Math.round(progressWidth)}
		aria-valuemin={0}
		aria-valuemax={100}
	></div>
</div>
