<script>
	import '../global.css';
	import NavBar from '../components/NavBar.svelte';
	import FooterBar from '../components/FooterBar.svelte';
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" />
</svelte:head>

<NavBar />
<div class="layout-container">
	<slot />
</div>
<FooterBar />

<style>
	.layout-container {
		min-height: 90vh;
		width: 100%;
	}
</style>
