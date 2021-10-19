<script lang="ts">
	import { page } from '$app/stores';

	export let className: string;
	export let title: string;
</script>

<svelte:head>
	<title>Nathan Meeker || {title}</title>
</svelte:head>

<div
	class="card-layout {className} {className}-btn"
	class:card-visible={$page.path === `/${className}`}
>
	<div class="container-border">
		<h1 class="card-title"><a href="/{className}">{title}</a></h1>
		<div id="{className}-card" class="card-inner">
			<slot />
		</div>
	</div>
</div>

<style>
	.card-layout {
		position: absolute;
		margin-top: 20px;
		width: 100%;
		height: 20vh;
		-webkit-clip-path: polygon(0 100%, 100% 0, 100% 20%, 20% 100%);
		clip-path: polygon(0 100%, 100% 0, 100% 20%, 20% 100%);
	}

	.card-close {
		-webkit-animation: subContainerViewAnim 0.5s linear backwards;
		animation: subContainerViewAnim 0.5s linear backwards;
	}

	.card-visible {
		width: 100%;
		top: 58px;
		height: calc(100% - 58px);
		-webkit-animation: subContainerViewAnim 5s linear forwards;
		animation: subContainerViewAnim 5s linear forwards;
		-webkit-transform: translateY(0);
		transform: translateY(0);
		overflow: auto;
	}

	.card-visible .card-title {
		margin: 20px;
		top: 10px;
		text-align: center;
		font-size: 2.5vmax;
	}

	.card-visible .card-inner {
		margin: 60px auto;
		padding: 40px 20px 100px 20px;
		line-height: 1.5;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-pack: center;
		-ms-flex-pack: center;
		justify-content: center;
		-webkit-box-orient: vertical;
		-webkit-box-direction: normal;
		-ms-flex-direction: column;
		flex-direction: column;
		width: 80%;
		font-size: 1.7vmax;
		text-align: justify;
	}

	.card-inner {
		position: relative;
		width: 80%;
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
	}

	.card-view {
		height: 500px;
	}

	.experience {
		background-color: var(--orange);
	}

	.experience .card-title {
		background-color: #1f2b62;
		background-image: linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);
		background-repeat: no-repeat;
		background-size: 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
		-webkit-animation: cardTitleText 3s linear infinite;
		animation: cardTitleText 3s linear infinite;
	}

	.about {
		background-color: var(--blue);
		-webkit-transform: translateY(5vh);
		transform: translateY(5vh);
	}

	.about .card-title {
		background-color: #1f2b62;
		background-image: linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);
		background-repeat: no-repeat;
		background-size: 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
	}

	.contact {
		background-color: var(--light-blue);
		-webkit-transform: translateY(10vh);
		transform: translateY(10vh);
	}

	.contact .card-title {
		background-color: #1f2b62;
		background-image: linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);
		background-repeat: no-repeat;
		background-size: 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
	}

	.extra {
		background-color: #222121;
		-webkit-clip-path: polygon(0 20vh, 100% 0, 100% 100%, 0% 100%);
		clip-path: polygon(0 20vh, 100% 0, 100% 100%, 0% 100%);
		-webkit-transform: translateY(15vh);
		transform: translateY(15vh);
	}

	@-webkit-keyframes subContainerReveal {
		0% {
			-webkit-transform: translate(110%, 65%);
			transform: translate(110%, 65%);
		}
		100% {
			-webkit-transform: translate(110%, 35%);
			transform: translate(110%, 35%);
		}
	}

	@keyframes subContainerReveal {
		0% {
			-webkit-transform: translate(110%, 65%);
			transform: translate(110%, 65%);
		}
		100% {
			-webkit-transform: translate(110%, 35%);
			transform: translate(110%, 35%);
		}
	}

	@-webkit-keyframes subContainerSlide {
		0% {
			-webkit-transform: translateY(50%);
			transform: translateY(50%);
		}
		100% {
			-webkit-transform: translateY(-50%);
			transform: translateY(-50%);
		}
	}

	@keyframes subContainerSlide {
		0% {
			-webkit-transform: translateY(50%);
			transform: translateY(50%);
		}
		100% {
			-webkit-transform: translateY(-50%);
			transform: translateY(-50%);
		}
	}

	@-webkit-keyframes subContainerViewAnim {
		0% {
			top: 74%;
			height: 55vh;
			-webkit-transform: translateY(0);
			transform: translateY(0);
			-webkit-clip-path: polygon(0 35%, 100% 0, 100% 20%, 20% 35%, 0 35%);
			clip-path: polygon(0 35%, 100% 0, 100% 20%, 20% 35%, 0 35%);
		}
		15% {
			-webkit-clip-path: polygon(0 25%, 100% 0, 100% 25%, 20% 35%, 0 35%);
			clip-path: polygon(0 25%, 100% 0, 100% 25%, 20% 35%, 0 35%);
		}
		30% {
			-webkit-clip-path: polygon(0 15%, 100% 0, 100% 30%, 20% 35%, 0 35%);
			clip-path: polygon(0 15%, 100% 0, 100% 30%, 20% 35%, 0 35%);
		}
		35% {
			height: 55vh;
			-webkit-clip-path: polygon(0 5%, 100% 0, 100% 35%, 0% 35%);
			clip-path: polygon(0 5%, 100% 0, 100% 35%, 0% 35%);
		}
		40% {
			top: 74%;
			height: 55vh;
			-webkit-clip-path: polygon(0 0%, 100% 0, 100% 35%, 0% 35%);
			clip-path: polygon(0 0%, 100% 0, 100% 35%, 0% 35%);
		}
		55% {
			top: 70%;
			height: 60%;
			-webkit-clip-path: polygon(0% 0%, 100% 0, 100% 45%, 0% 45%);
			clip-path: polygon(0% 0%, 100% 0, 100% 45%, 0% 45%);
		}
		60% {
			top: 65%;
			height: 65%;
			-webkit-clip-path: polygon(0% 0%, 100% 0, 100% 65%, 0% 65%);
			clip-path: polygon(0% 0%, 100% 0, 100% 65%, 0% 65%);
		}
		65% {
			-webkit-clip-path: polygon(0% 0%, 100% 0, 100% 70%, 0% 70%);
			clip-path: polygon(0% 0%, 100% 0, 100% 70%, 0% 70%);
		}
		70% {
			top: 60%;
			height: 75%;
			-webkit-transform: translateY(0);
			transform: translateY(0);
			-webkit-clip-path: polygon(0% 0%, 100% 0, 100% 80%, 0% 80%);
			clip-path: polygon(0% 0%, 100% 0, 100% 80%, 0% 80%);
		}
		75% {
			-webkit-clip-path: polygon(0 0%, 100% 0, 100% 90%, 0% 90%);
			clip-path: polygon(0 0%, 100% 0, 100% 90%, 0% 90%);
		}
		100% {
			width: 100%;
			top: 58px;
			height: calc(100% - 58px);
			-webkit-transform: translateY(0);
			transform: translateY(0);
			-webkit-clip-path: polygon(0 0, 100% 0, 100% 95%, 0 95%);
			clip-path: polygon(0 0, 100% 0, 100% 95%, 0 95%);
		}
	}

	@keyframes subContainerViewAnim {
		0% {
			top: 74%;
			height: 55vh;
			-webkit-transform: translateY(0);
			transform: translateY(0);
			-webkit-clip-path: polygon(0 35%, 100% 0, 100% 20%, 20% 35%, 0 35%);
			clip-path: polygon(0 35%, 100% 0, 100% 20%, 20% 35%, 0 35%);
		}
		/* 15% {
			top: 70%;
			-webkit-clip-path: polygon(0 25%, 100% 0, 100% 25%, 20% 35%, 0 35%);
			clip-path: polygon(0 25%, 100% 0, 100% 25%, 20% 35%, 0 35%);
		}
		30% {
			top: 65%;
			height: calc(100% - 58px);
			-webkit-clip-path: polygon(0 15%, 100% 0, 100% 30%, 20% 35%, 0 35%);
			clip-path: polygon(0 15%, 100% 0, 100% 30%, 20% 35%, 0 35%);
		}
		35% {
			top: 60%;
			height: 55vh;
			-webkit-clip-path: polygon(0 5%, 100% 0, 100% 35%, 0% 35%);
			clip-path: polygon(0 5%, 100% 0, 100% 35%, 0% 35%);
		}
		40% {
			top: 55%;
			height: 55vh;
			height: calc(100% - 58px);
			-webkit-clip-path: polygon(0 0%, 100% 0, 100% 35%, 0% 35%);
			clip-path: polygon(0 0%, 100% 0, 100% 35%, 0% 35%);
		} */
		55% {
			top: 50%;
			/* height: 60%; */
			height: calc(100% - 58px);
			-webkit-clip-path: polygon(0% 0%, 100% 0, 100% 45%, 0% 45%);
			clip-path: polygon(0% 0%, 100% 0, 100% 45%, 0% 45%);
		}
		/* 60% {
			top: 50%;
			height: 65%;
			height: calc(100% - 58px);
			-webkit-clip-path: polygon(0% 0%, 100% 0, 100% 65%, 0% 65%);
			clip-path: polygon(0% 0%, 100% 0, 100% 65%, 0% 65%);
		}
		65% {
			-webkit-clip-path: polygon(0% 0%, 100% 0, 100% 70%, 0% 70%);
			clip-path: polygon(0% 0%, 100% 0, 100% 70%, 0% 70%);
		}
		70% {
			top: 50%;
			height: calc(100% - 58px);
			height: 75%;
			-webkit-transform: translateY(0);
			transform: translateY(0);
			-webkit-clip-path: polygon(0% 0%, 100% 0, 100% 80%, 0% 80%);
			clip-path: polygon(0% 0%, 100% 0, 100% 100%, 0% 100%);
		}
		75% {
			top: 50%;
			-webkit-clip-path: polygon(0 0%, 100% 0, 100% 90%, 0% 90%);
			clip-path: polygon(0 0%, 100% 0, 100% 100%, 0% 100%);
		} */
		100% {
			width: 100%;
			top: 58px;
			height: calc(100% - 50px);
			-webkit-transform: translateY(0);
			transform: translateY(0);
			-webkit-clip-path: polygon(0 0, 100% 0, 100% 95%, 0 95%);
			clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
			position: relative;
			margin-top: 5em;
		}
	}
</style>
