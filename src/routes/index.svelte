<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	let textAngle;

	onMount(() => adjustText(textAngle));
	const adjustText = (node: any) => {
		const sideA = node.clientHeight; //Height
		const sideB = node.clientWidth; //Width
		const angle = Math.atan2(sideA, sideB); //tangent of a/b gives angle in radians
		document.documentElement.style.setProperty('--top-calc', `${650}%`);
		document.documentElement.style.setProperty('--sub-container-diagonal', `-${angle}rad`);
	};
</script>

<svelte:head>
	<title>Nathan Meeker || Home</title>
</svelte:head>

<svelte:window
	on:resize={() => {
		adjustText(textAngle);
	}}
/>

<div class="main-container" in:fly={{ y: -100, duration: 500, delay: 400 }} out:fade>
	<div class="title">
		<div>
			<div class="animated-text">
				<div class="title-block">
					<span class="title-main gradient-text">Nathan Meeker</span>
					<span class="title-secondary gradient-text">Come See the Whole Picture</span>
				</div>
			</div>
		</div>
	</div>
	<div id="card-container" class="card card-container">
		<div class="card-layout experience experience-btn" bind:this={textAngle}>
			<h1 class="card-title"><a href="/experience">Experience</a></h1>
		</div>
		<div class="card-layout about about-btn">
			<h1 class="card-title"><a href="/about">About</a></h1>
		</div>
		<div class="card-layout contact contact-btn">
			<h1 class="card-title"><a href="/contact">Contact</a></h1>
		</div>
		<div class="card-layout extra extra-btn" />
	</div>
</div>

<style>
	.main-container {
		position: relative;
	}
	.title {
		position: relative;
		height: 95vh;
		background-image: -webkit-gradient(
				linear,
				left top,
				right top,
				from(rgba(85, 188, 201, 0.3)),
				to(rgba(63, 238, 230, 0.9))
			),
			url('/IMG_1521.jpeg');
		background-image: linear-gradient(to right, rgba(85, 188, 201, 0.3), rgba(63, 238, 230, 0.9)),
			url('/IMG_1521.jpeg');
		background-repeat: no-repeat;
		background-size: cover;
		-webkit-animation: pictureReveal 1.5s linear 2s;
		animation: pictureReveal 1.5s linear 2s;
		-webkit-animation-fill-mode: backwards;
		animation-fill-mode: backwards;
		-webkit-clip-path: polygon(0 0, 100% 0, 100% 77%, 0 98%);
		clip-path: polygon(0 0, 100% 0, 100% 77%, 0 98%);
	}

	.title-block {
		position: absolute;
		top: 40%;
		left: 50%;
		width: 100%;
		-webkit-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
		text-align: center;
	}

	.title-main {
		background-color: #1f2b62;
		background-image: linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);
		background-repeat: no-repeat;
		background-size: 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
		text-transform: uppercase;
		display: block;
		font-size: 8vmax;
		-webkit-animation: titleSwoop 1.5s linear;
		animation: titleSwoop 1.5s linear;
	}

	.title-secondary {
		background-color: #1f2b62;
		background-image: linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);
		background-repeat: no-repeat;
		background-size: 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
		text-transform: uppercase;
		display: block;
		line-height: 1.5rem;
		letter-spacing: 0.65rem;
		font-size: 1.5vmax;
		margin-bottom: 40px;
		text-align: center;
		-webkit-animation: subTitleSwoop 1.5s linear 3s;
		animation: subTitleSwoop 1.5s linear 3s;
		-webkit-animation-fill-mode: backwards;
		animation-fill-mode: backwards;
	}

	@-webkit-keyframes pictureReveal {
		0% {
			background-image: -webkit-gradient(linear, left top, right top, from(#55bcc9), to(#3feee6)),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, #55bcc9, #3feee6), url('/IMG_1521.jpeg');
		}
		25% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.8)),
					to(rgba(63, 238, 230, 0.97))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.8), rgba(63, 238, 230, 0.97)),
				url('/IMG_1521.jpeg');
		}
		50% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.6)),
					to(rgba(63, 238, 230, 0.95))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.6), rgba(63, 238, 230, 0.95)),
				url('/IMG_1521.jpeg');
		}
		75% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.4)),
					to(rgba(63, 238, 230, 0.93))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.4), rgba(63, 238, 230, 0.93)),
				url('/IMG_1521.jpeg');
		}
		100% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.3)),
					to(rgba(63, 238, 230, 0.9))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.3), rgba(63, 238, 230, 0.9)),
				url('/IMG_1521.jpeg');
		}
	}

	@keyframes pictureReveal {
		0% {
			background-image: -webkit-gradient(linear, left top, right top, from(#55bcc9), to(#3feee6)),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, #55bcc9, #3feee6), url('/IMG_1521.jpeg');
		}
		25% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.8)),
					to(rgba(63, 238, 230, 0.97))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.8), rgba(63, 238, 230, 0.97)),
				url('/IMG_1521.jpeg');
		}
		50% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.6)),
					to(rgba(63, 238, 230, 0.95))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.6), rgba(63, 238, 230, 0.95)),
				url('/IMG_1521.jpeg');
		}
		75% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.4)),
					to(rgba(63, 238, 230, 0.93))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.4), rgba(63, 238, 230, 0.93)),
				url('/IMG_1521.jpeg');
		}
		100% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.3)),
					to(rgba(63, 238, 230, 0.9))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.3), rgba(63, 238, 230, 0.9)),
				url('/IMG_1521.jpeg');
		}
	}

	@-webkit-keyframes titleSwoop {
		0% {
			width: 100vw;
			letter-spacing: 3rem;
			opacity: 0;
		}
		100% {
			width: 100vw;
			letter-spacing: 2px;
			opacity: 1;
		}
	}

	@keyframes titleSwoop {
		0% {
			width: 100vw;
			letter-spacing: 3rem;
			opacity: 0;
		}
		100% {
			width: 100vw;
			letter-spacing: 2px;
			opacity: 1;
		}
	}

	@-webkit-keyframes subTitleSwoop {
		0% {
			-webkit-transform: translateY(-60px);
			transform: translateY(-60px);
			opacity: 0;
		}
		100% {
			-webkit-transform: translateY(0px);
			transform: translateY(0px);
			opacity: 1;
		}
	}

	@keyframes subTitleSwoop {
		0% {
			-webkit-transform: translateY(-60px);
			transform: translateY(-60px);
			opacity: 0;
		}
		100% {
			-webkit-transform: translateY(0px);
			transform: translateY(0px);
			opacity: 1;
		}
	}
	.card {
		width: 100%;
	}

	.card-layout {
		position: absolute;
		width: 100%;
		height: 20vh;
		-webkit-clip-path: polygon(0 100%, 100% 0, 100% 20%, 20% 100%);
		clip-path: polygon(0 100%, 100% 0, 100% 20%, 20% 100%);
	}

	.card-container {
		position: absolute;
		bottom: 1vh;
		height: 20vh;
		width: 100%;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-orient: vertical;
		-webkit-box-direction: normal;
		-ms-flex-direction: column;
		flex-direction: column;
		color: #3feee6;
		overflow: hidden;
		-webkit-clip-path: polygon(0 100%, 100% 0, 100% 100%, 100% 100%);
		clip-path: polygon(0 100%, 100% 0, 100% 100%, 100% 100%);
	}

	.card-title {
		position: absolute;
		right: 10px;
		text-align: right;
		font-size: 1.7vmax;
		text-transform: uppercase;
		width: 100%;
		top: 53%;
		-webkit-transform: rotate(var(--sub-container-diagonal));
		transform: rotate(var(--sub-container-diagonal));
		color: #222121;
		cursor: pointer;
		background-color: #1f2b62;
		background-image: linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);
		background-repeat: no-repeat;
		background-size: 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
	}

	.experience {
		background-color: var(--orange);
	}
	.experience .card-title {
		-webkit-animation: cardTitleText 3s linear infinite;
		animation: cardTitleText 3s linear infinite;
	}

	.about {
		background-color: var(--blue);
		-webkit-transform: translateY(5vh);
		transform: translateY(5vh);
	}

	.about .card-title {
		-webkit-animation: cardTitleText 3s linear 0.5s infinite;
		animation: cardTitleText 3s linear 0.5s infinite;
	}

	.contact {
		background-color: var(--light-blue);
		-webkit-transform: translateY(10vh);
		transform: translateY(10vh);
	}
	.contact .card-title {
		-webkit-animation: cardTitleText 3s linear 1s infinite;
		animation: cardTitleText 3s linear 1s infinite;
	}

	.extra {
		background-color: var(--black);
		-webkit-clip-path: polygon(0 20vh, 100% 0, 100% 100%, 0% 100%);
		clip-path: polygon(0 20vh, 100% 0, 100% 100%, 0% 100%);
		-webkit-transform: translateY(15vh);
		transform: translateY(15vh);
	}

	@-webkit-keyframes cardTitleText {
		0% {
			background-image: linear-gradient(-43deg, #222121 100%, #ffffff 100%);
		}
		5% {
			background-image: linear-gradient(43deg, #222121 94%, #ffffff 100%);
		}
		10% {
			background-image: linear-gradient(43deg, #222121 94%, #ffffff 100%);
		}
		15% {
			background-image: linear-gradient(-43deg, #222121 100%, #ffffff 100%);
		}
		100% {
			background-image: linear-gradient(-43deg, #222121 100%, #ffffff 100%);
		}
	}

	@keyframes cardTitleText {
		0% {
			background-image: linear-gradient(-43deg, #222121 100%, #ffffff 100%);
		}
		5% {
			background-image: linear-gradient(43deg, #222121 94%, #ffffff 100%);
		}
		10% {
			background-image: linear-gradient(43deg, #222121 94%, #ffffff 100%);
		}
		15% {
			background-image: linear-gradient(-43deg, #222121 100%, #ffffff 100%);
		}
		100% {
			background-image: linear-gradient(-43deg, #222121 100%, #ffffff 100%);
		}
	}
</style>
