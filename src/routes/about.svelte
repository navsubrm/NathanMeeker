<script lang="ts">
	import { page } from '$app/stores';
	import { fly, fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>Nathan Meeker || About</title>
</svelte:head>

<div in:fly={{ y: -100, duration: 500, delay: 400 }} out:fade>
	<div class="container-border">
		<h1 class="card-title">About</h1>
		<div id="about-card" class="card-inner">
			<div class="center">
				<p>
					I am a 24 year Navy veteran with a passion for finding and applying data-driven solutions
					to improve business outcomes. In my years of service I have developed a passion for
					life-long learning and watching technology trends for ways to improve productivity,
					quality of work, and quality of life.
				</p>

				<p>
					<strong>Back story:</strong> I enlisted in the Navy in 1997 as a
					<a
						title="Submarine Communications Electronics Technician description."
						href="https://www.careersinthemilitary.com/service-career-detail/navy/electrical-instrument-and-equipment-repairers/electronics-technician--submarine--communications"
						>Submarine Communications Electronics Technician.</a
					>
					Served for 16 years enlisted, then commissioned as a
					<a
						title="Submarine Communications Limited Duty Officer (LDO) description."
						href="https://www.cool.osd.mil/usn/officer/odc629x.htm"
						>Submarine Communications Limited Duty Officer</a
					>
					and Completed my Bachelor's in Business Administration.
					<a
						title="Portfolium page with college information."
						href="https://portfolium.com/NathanMeeker2">Check out my Portfolium profile.</a
					>
					I later transitioned to the
					<a
						title="Information Professional Corps description."
						href="https://www.navy.com/careers/information-professional"
						>Information Professional Corp</a
					> and have been working on my MBA with an emphasis in technology Management. Recently, over
					the last couple of years, I have invested considerable time developing custom MS SharePoint
					solutions to support tele-work changes occurring from the COVID-19 pandemic.
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.center {
		background-color: var(--orange, 0.5);
		border-radius: 0.5em;
		box-shadow: 5px 10px 25px var(--shadow-color);
		margin: auto;
		width: 60%;
	}
	p {
		text-align: center;
		line-height: 1.5em;
		margin: 15px;
		padding: 15px;
	}
</style>
