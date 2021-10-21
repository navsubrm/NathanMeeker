<script>
	import '../global.css';
	import NavBar from '../components/NavBar.svelte';
	import FooterBar from '../components/FooterBar.svelte';
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" />
</svelte:head>

<NavBar />
<slot />
<FooterBar />

<style>
</style>
