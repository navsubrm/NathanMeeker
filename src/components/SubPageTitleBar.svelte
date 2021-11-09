<script lang="ts">
	export let title: string;
	export let colorVar: string;
	export let textColor: string;
</script>

<div class="title-bar" style="background-color: {colorVar}">
	<header class="header">
		<h1 style="--header-color: {textColor};">
			{title}
		</h1>
	</header>
</div>

<style>
	.title-bar {
		position: sticky;
		top: 7vh;
		margin: 30px auto;
		display: flex;
		justify-content: center;
		align-content: center;
		z-index: 1;
		min-height: 10vh;
	}
	.header {
		margin-top: 0px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 90%;
		text-align: center;
	}
	h1 {
		height: max-content;
		font-size: 4.5vmax;
		font-family: Roboto, Helvetica, sans-serif;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: transparent;
		-webkit-text-fill-color: transparent;
		background: center
			linear-gradient(
				to right,
				var(--shadow-color) 0%,
				var(--header-color) 50%,
				var(--header-color) 60%,
				var(--shadow-color) 100%
			);
		background-size: 60%;
		background-clip: text;
		-webkit-background-clip: text;
		animation: shimmer 4s linear infinite alternate;
		-webkit-animation: shimmer 4s linear infinite alternate;
	}

	@keyframes shimmer {
		0% {
			background-position: left;
		}
		80% {
			background-position: left;
		}
		100% {
			background-position: right;
		}
	}

	@media only screen and (max-width: 600px) {
		.title-bar {
			top: 7vh;
			min-height: 15vh;
		}
		h1 {
			font-size: 2.5em;
			text-align: center;
			letter-spacing: normal;
		}
	}
</style>
