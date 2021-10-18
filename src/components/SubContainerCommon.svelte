<script lang=ts>
	import { page } from "$app/stores"
  export let className: string;
  export let title: string;
	export let body: string = "";
</script>

<svelte:head>
  <title>Nathan Meeker || {title}</title>
</svelte:head>

<div class='card-layout {className} {className}-btn' class:card-visible={$page.path === `/${className}`}>
  <h1 class="card-title"><a href="/{className}">{title}</a></h1>
  <div id="{className}-card" class="card-inner">

		{@html body}

  </div>
</div>

<style>
.card-layout {
	position: absolute;
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
	-webkit-animation: subContainerViewAnim 1s linear forwards;
	animation: subContainerViewAnim 1s linear forwards;
	-webkit-transform: translateY(0);
	transform: translateY(0);
	overflow: scroll;
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

.card-visible .card-inner ul,
.card-visible .card-inner li {
	padding: 5px;
	list-style: square;
	margin-left: 20px;
	text-decoration: none;
}

.card-visible .card-inner ul strong,
.card-visible .card-inner li strong {
	font-size: 2vmax;
}

.card-visible .card-inner .center-text {
	text-align: center;
}

.card-visible .card-inner form {
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: vertical;
	-webkit-box-direction: normal;
	-ms-flex-direction: column;
	flex-direction: column;
	text-transform: uppercase;
	width: 80%;
	margin: auto;
}

.card-visible .card-inner form input,
.card-visible .card-inner form textarea {
	padding: 10px;
	margin: 5px;
	font-size: 1em;
	border: none;
	border-radius: 0.2em;
	cursor: pointer;
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
	background-color: #eeae25;
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
	background-color: #97caef;
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
	-webkit-animation: cardTitleText 3s linear 0.5s infinite;
	animation: cardTitleText 3s linear 0.5s infinite;
}

.contact {
	background-color: #cafafe;
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
	-webkit-animation: cardTitleText 3s linear 1s infinite;
	animation: cardTitleText 3s linear 1s infinite;
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
</style>