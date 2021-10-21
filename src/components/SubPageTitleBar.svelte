<script lang="ts">
	export let title: string;
	export let colorVar: string;
</script>

<div class="title-bar" style="background-color: {colorVar}">
	<div class="header">
		<h1>{title}</h1>
	</div>
</div>

<style>
	.title-bar {
		position: relative;
		margin-top: 70px;
		display: flex;
		justify-content: center;
		align-content: center;
		height: 20vh;
	}
	.header {
		margin-top: 0px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: fit-content;
	}
	h1 {
		font-size: 5em;
		font-family: Roboto, Helvetica, sans-serif;
		font-weight: 700;
		color: white;
		text-transform: uppercase;
	}
</style>
