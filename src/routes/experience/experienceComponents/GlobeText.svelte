<script lang="ts">
	let deg: number = 0;
	let rotationSpeed: ReturnType<typeof setInterval>;
	let globe: HTMLDivElement;
	export let totalTitleLetters: number;
	export let spread: number;
	export let route: string;

	// Updates the central degree for text 360deg rotation.
	const updateDeg = () => {
		rotationSpeed = setInterval(() => {
			if (deg < 360) return (deg += 1);
			return clearInterval(rotationSpeed);
		}, 1);
	};

	//focuses the globe
	const unmute = () => {
		if (!globe.classList.contains('muted')) return;
		globe.classList.remove('muted');
		deg = 0;
		updateDeg();
	};

	//Removes focus from the globe
	const mute = () => {
		if (globe.classList.contains('muted')) return;
		globe.classList.add('muted');
		clearInterval(rotationSpeed);
		deg = 0;
	};
</script>

<div
	class="container muted"
	bind:this={globe}
	on:mouseover={unmute}
	on:focus={unmute}
	on:blur={mute}
	on:mouseout={mute}
>
	<div class="card-sm">
		<div class="perspective">
			<h1
				class="text"
				style="--degOff:-{deg}deg; --totalLetters:{totalTitleLetters}; --spread: {spread}deg;"
			>
				<slot name="title" />
			</h1>
		</div>
	</div>
	<a class="btn btn-main details" href={route}>details</a>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		cursor: pointer;
	}
	.perspective {
		transform-style: preserve-3d;
		position: absolute;
		top: 44%;
		left: 44%;
		transform: translate3d(-50%, -50%, 0);
		pointer-events: none;
	}

	.text {
		font-size: 1.5em;
		-webkit-backface-visibility: hidden;
		-moz-backface-visibility: hidden;
		backface-visibility: hidden;
		transform: preserve-3d;
		margin: 0px auto;
		text-align: center;
		pointer-events: none;
	}
	.text :global(span) {
		position: absolute;
		text-transform: uppercase;
		-webkit-backface-visibility: hidden;
		-moz-backface-visibility: hidden;
		backface-visibility: hidden;
		top: 0;
		left: 0;
		width: 45px;
		text-align: center;
		transform-origin: center;
		transform-style: preserve-3d;
		transform: rotateY(
				calc(var(--degOff) + calc(var(--rot-posit) * calc(var(--spread) / var(--totalLetters))))
			)
			translateZ(200px);
	}

	.card-sm {
		position: relative;
		width: 300px;
		height: 300px;
		padding: 10px;
		margin-bottom: 60px;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		font-size: 1.3em;
		border-radius: 50%;
		box-shadow: inset 0px 0px 380px var(--orange), inset 0px 5px 60px rgb(10, 10, 10);
		cursor: pointer;
		z-index: 0;
		pointer-events: none;
	}
	.card-sm::after {
		content: '';
		width: 5px;
		height: 5px;
		background-color: #444444;
		border-radius: 50%;
		display: block;
		position: absolute;
		bottom: -50px;
		transform: rotate3d(1, 0, 0, 80deg);
		-webkit-box-shadow: 0px 0px 100px 2px #444444;
		-moz-box-shadow: 0px 0px 8px 2px #444444;
		box-shadow: 0px 0px 100px 100px #444444;
		pointer-events: none;
	}
	.details {
		color: var(--orange);
		border: solid 2px var(--orange);
	}
	.muted {
		filter: opacity(0.5) grayscale(0.4);
		transform: scale(0.7);
	}
</style>
