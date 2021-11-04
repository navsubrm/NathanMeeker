<script>
	import ExperienceHeader from '../../components/ExperienceHeader.svelte';
</script>

<ExperienceHeader />
<div class="layout-container">
	<slot />
</div>

<style>
	.layout-container {
		min-height: 90vh;
		width: 100%;
	}
</style>
