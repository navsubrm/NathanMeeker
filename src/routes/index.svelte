<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import TitleBar from '../components/TitleBar.svelte';
	import { watchResize } from '../../node_modules/svelte-watch-resize';

	const adjustText = (node: any) => {
		console.log('ran');
		const sideA = node.clientHeight; //Height
		const sideB = node.clientWidth; //Width
		const angle = Math.atan2(sideA, sideB); //tangent of a/b gives angle in radians
		document.documentElement.style.setProperty('--top-calc', `${650}%`);
		document.documentElement.style.setProperty('--sub-container-diagonal', `-${angle}rad`);
	};
	let transitionValue = false;

	const transition = () => {
		transitionValue = true;
		setTimeout(() => {
			goto('/experience');
			transitionValue = false;
		}, 2000);
	};
</script>

<svelte:head>
	<title>Nathan Meeker || Home</title>
</svelte:head>

<svelte:body
	on:click={(e) => {
		console.log(e.target);
	}} />

<TitleBar />
<div
	id="card-container"
	class="card card-container {transitionValue === true ? 'transition' : ''}"
	use:watchResize={adjustText}
>
	<div class="card-layout experience experience-btn">
		<h1 class="card-title" on:click={transition}>Experience</h1>
	</div>
	<div class="card-layout about about-btn">
		<h1 class="card-title"><a href="/about">About</a></h1>
	</div>
	<div class="card-layout contact contact-btn">
		<h1 class="card-title"><a href="/contact">Contact</a></h1>
	</div>
	<div class="card-layout extra extra-btn" />
</div>

<style>
	.card {
		width: 100%;
	}

	.card-layout {
		position: absolute;
		margin-top: 20px;
		width: 100%;
		height: 20vh;
		-webkit-clip-path: polygon(0 100%, 100% 0, 100% 20%, 20% 100%);
		clip-path: polygon(0 100%, 100% 0, 100% 20%, 20% 100%);
	}

	.card-container {
		position: absolute;
		top: 74vh;
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

	.transition {
		animation: fadeOut 2s linear forwards;
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

	@keyframes fadeOut {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>
