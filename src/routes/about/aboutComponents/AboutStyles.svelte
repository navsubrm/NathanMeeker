<script>
	const scrollTop = () => {
		window.scrollTo(0, 0);
	};
</script>

<div class="container">
	<slot name="image">
		<div class="about-image default-image">No content</div>
	</slot>

	<div class="content">
		<slot name="content">
			<div class="content">nothing to show</div>
		</slot>
	</div>
	<button class="btn btn-main btn-center scroll-btn" on:click={scrollTop}>Scroll Top</button>
</div>

<style>
	.container {
		position: relative;
		display: grid;
		place-items: center;
		grid-template-areas:
			'text image'
			'scroll-btn scroll-btn';
		min-height: 70vh;
		margin: 20px auto 0px auto;
		padding: 4em;
	}
	.scroll-btn {
		grid-area: scroll-btn;
	}

	:global(.about-image) {
		grid-area: image;
		height: 20vmax;
		width: 35vmax;
		margin-right: 100px;
		border-radius: 0.9em;
		box-shadow: inset 0 0 40px var(--shadow-color), 5px 10px 25px var(--experience-text);
		background-position: center;
	}

	.default-image {
		background: linear-gradient(rgba(49, 82, 80, 0.609), rgba(63, 238, 230, 0.7)), no-repeat;
	}

	.content {
		grid-area: text;
		width: clamp(400px, 90%, 900px);
		font-size: 18px;
		padding: 50px;
	}
	:global(.about-p),
	:global(.about-strong),
	:global(.about-a),
	:global(.about-li) {
		margin: 40px auto 40px auto;
		color: var(--experience-text);
	}
	:global(.about-h2) {
		font-size: 1.3em;
	}

	:global(.about-p),
	:global(.about-strong) {
		line-height: 2em;
	}

	@media only screen and (max-width: 1500px) {
		.container {
			grid-template-areas:
				'image'
				'text'
				'scroll-btn';
			padding: 5px;
		}
		:global(.about-image) {
			height: 30vmax;
			width: 50vmax;
			margin-right: 0;
		}
		.content {
			width: 90%;
		}
	}

	@media only screen and (max-width: 850px) {
		:global(.about-image) {
			height: 30vmax;
			width: 55vmax;
		}
		:global(.about-image) > :global(p) {
			font-size: 2em;
		}
	}
</style>
