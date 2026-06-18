<script lang="ts">
	import PanelLeftClose from '@lucide/svelte/icons/panel-left-close';
	import PanelLeftOpen from '@lucide/svelte/icons/panel-left-open';

	let {
		sections,
		selectedCourse = $bindable(),
		collapsed = $bindable()
	}: {
		sections: string[];
		selectedCourse: string;
		collapsed: boolean;
	} = $props();

	function selectCourse(course: string) {
		selectedCourse = course;
	}

	function toggleCollapsed() {
		collapsed = !collapsed;
	}
</script>

<div
	class="{collapsed ? 'w-10' : 'w-1/4'} flex min-h-0 flex-col border-r transition-[width] duration-200"
>
	<div class="flex-none {collapsed ? 'p-2' : 'border-b p-3'}">
		<div class="flex items-center justify-between">
			{#if !collapsed}<span class="font-bold">Courses</span>{/if}
			<button
				class="rounded p-1 text-muted-foreground hover:text-foreground"
				onclick={toggleCollapsed}
				aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			>
				{#if collapsed}
					<PanelLeftOpen class="h-4 w-4" />
				{:else}
					<PanelLeftClose class="h-4 w-4" />
				{/if}
			</button>
		</div>
	</div>
	{#if !collapsed}
		<div
			class="flex-1 space-y-1 overflow-y-auto p-2
			[&::-webkit-scrollbar]:w-4
			[&::-webkit-scrollbar-thumb]:bg-[hsl(var(--border))]
			[&::-webkit-scrollbar-track]:bg-transparent"
			style="scrollbar-width: thin; scrollbar-color: hsl(var(--border)) transparent"
		>
			{#each sections as course (course)}
				<button
					class="w-full rounded px-3 py-1.5 text-left text-sm transition-colors
					{selectedCourse === course ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
					onclick={() => selectCourse(course)}
					aria-current={selectedCourse === course ? 'page' : undefined}
				>
					{course}
				</button>
			{/each}
		</div>
	{/if}
</div>
