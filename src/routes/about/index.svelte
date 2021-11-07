<script lang="ts">
	import SubPageTitleBar from '../../components/SubPageTitleBar.svelte';
	import { fly, fade } from 'svelte/transition';
	import AboutBluf from './aboutComponents/AboutBluf.svelte';
	import AboutBackstory from './aboutComponents/AboutBackstory.svelte';
</script>

<svelte:head>
	<title>Nathan Meeker || About</title>
</svelte:head>

<div in:fly={{ y: -100, duration: 500, delay: 400 }} out:fade>
	<SubPageTitleBar title={'about me'} colorVar={'white'} textColor={'var(--blue)'} />
	<AboutBluf />
	<AboutBackstory />
</div>

<style>
	.local-image {
		background: linear-gradient(rgba(49, 82, 80, 0.609), rgba(63, 238, 230, 0.7)),
			url('/FS0A5054.png') no-repeat;
		background-size: cover;
	}
</style>
