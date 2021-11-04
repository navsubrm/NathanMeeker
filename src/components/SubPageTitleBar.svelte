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
		position: sticky;
		top: 5vh;
		margin-top: 30px;
		display: flex;
		justify-content: center;
		align-content: center;
		height: 15vh;
		z-index: 1;
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
		font-size: 8vmax;
		font-family: Roboto, Helvetica, sans-serif;
		font-weight: 700;
		color: white;
		text-transform: uppercase;
	}

	@media only screen and (max-width: 600px) {
		.title-bar {
			top: 7vh;
		}
		h1 {
			font-size: 3em;
			text-align: center;
		}
	}
</style>
