<script lang="ts">
	import TitleBar from '../components/TitleBar.svelte';
	import SubContainerCommon from '../components/SubContainerCommon.svelte';
	import { watchResize } from '../../node_modules/svelte-watch-resize';

	const adjustText = (node: any) => {
		console.log('ran');
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

<svelte:body
	on:click={(e) => {
		console.log(e.target);
	}} />

<TitleBar />
<div id="card-container" class="card card-container" use:watchResize={adjustText}>
	<SubContainerCommon className={'experience'} title={'Experience'} />
	<SubContainerCommon className={'about'} title={'About Me'} />
	<SubContainerCommon className={'contact'} title={'Contact'} />
	<SubContainerCommon className={'extra'} title={'Extra'} />
</div>

<style>
	.card {
		width: 100%;
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
</style>
