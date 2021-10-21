<script lang="ts">
	export let title: string;
	export let colorVar: string;
</script>

<div class="title-bar">
	<div class="header">
		<h1>{title}</h1>
	</div>
</div>

<style>
	.title-bar {
		display: flex;
		justify-content: center;
		align-content: center;
		height: 50vh;
		background-color: var(--orange);
		border: solid 1px black;
	}
	.header {
		margin-top: 60px;
		display: flex;
		justify-content: center;
		align-content: center;
		width: fit-content;
		width: 100%;
		border: solid 1px black;
	}
	h1 {
		font-size: 3em;
		font-weight: bold;
		color: white;
		text-transform: uppercase;
	}
</style>
