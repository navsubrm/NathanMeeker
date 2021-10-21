<script lang="ts">
	import { page } from '$app/stores';
	import { fly, fade } from 'svelte/transition';
	import SubTitleBar from '../components/SubTitleBar.svelte';
</script>

<svelte:head>
	<title>Nathan Meeker || Experience</title>
</svelte:head>

<div in:fly={{ y: -100, duration: 500, delay: 400 }} out:fade>
	<SubTitleBar title={'experience'} colorVar={'--orange'} />
	<div class="container-border">
		<div class="card-container">
			<div class="card-sm">
				<h1>General Experience</h1>
				<div class="card-bg hidden">
					<strong>24 years of professional experience in the US Navy:</strong>
					<strong>Communications Security Manager (COMSEC) / Inspector 10+ years:</strong>
					<ul>
						<li>COMSEC(EKMS/KMI) Manager 5+ years.</li>
						<li>COMSEC(EKMS/KMI) Inspector 10+ years.</li>
						<li>
							Navy Communications Security Management System <a
								title="Navy COMSEC Management System webpage."
								href="https://www.navifor.usff.navy.mil/ncms/">(NCMS)</a
							> certified inspector since 2010.
						</li>
					</ul>
				</div>
			</div>
			<div class="card-sm">
				<h1>Cyber Security</h1>
				<div class="card-bg hidden">
					<strong>Information Systems Security Manager / Network administrator 10+ years:</strong>
					<ul>
						<li>COMPTIA Security+ certified 7+ years.</li>
						<li>MS SharePoint Administrator 5+ years.</li>
						<li>MS SharePoint development 2+ years.</li>
						<li>Proficient with HTML, CSS, JavaScript, and React.</li>
					</ul>
				</div>
			</div>
			<div class="card-sm">
				<h1>Network Administration</h1>
			</div>
			<div class="card-sm">
				<h1>Web Development</h1>
				<div class="card-bg hidden">
					<ul>
						<li>COMPTIA Security+ certified 7+ years.</li>
						<li>MS SharePoint Administrator 5+ years.</li>
						<li>MS SharePoint development 2+ years.</li>
						<li>Proficient with HTML, CSS, JavaScript, and React.</li>
					</ul>
				</div>
			</div>
			<div class="card-sm">
				<h1>Security Management</h1>
				<div class="card-bg hidden">
					<strong>Personnel Security Management 10+ years:</strong>
					<ul>
						<li>DoD Security Professional Education and Development (SPeD) Certifications:</li>
						<li>General Security Administration 21+ years.</li>
						<li>Command Security Manager 15+ years.</li>
						<li>
							<a
								title="Center for Security Excellence SFPC certification webpage."
								href="https://www.cdse.edu/certification/sfpc.html"
								>Security Professional Fundamentals (SFPC) 3+ years.</a
							>
						</li>
						<li>
							<a
								title="Center for Security Excellence PSC certification webpage."
								href="https://www.cdse.edu/certification/psc.html"
								>Physical Security Certification (PSC) 3+ years.</a
							>
						</li>
					</ul>
				</div>
			</div>
			<div class="card-sm">
				<h1>Education</h1>
				<div class="card-bg hidden">
					<strong
						>Bachelor's degree in Business Administration from Excelsior College. (2015).</strong
					>
					<strong
						>12 semester hours from completing an MBA with emphasis in technology management.</strong
					>
					<strong>Sigma Beta Delta National Honor Society for Business (2019).</strong>
				</div>
			</div>
		</div>
		<p class="center-text">
			<em>For further details, check out my social media links at the bottom of this page.</em>
		</p>
	</div>
</div>

<style>
	.title {
		text-align: center;
		text-transform: uppercase;
		font-size: 3em;
	}

	.card-sm {
		position: relative;
		width: 300px;
		height: 300px;
		padding: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		font-size: 1.3em;
		border-radius: 50%;
		box-shadow: inset 0px 5px 280px var(--orange);
		cursor: pointer;
	}
	.card-sm::after {
		content: '';
		width: 5px;
		height: 5px;
		background-color: #444444;
		border-radius: 50%;
		display: block;
		position: absolute;
		bottom: -50px;
		z-index: -2;
		transform: rotate3d(1, 0, 0, 80deg);
		-webkit-box-shadow: 0px 0px 100px 2px #444444;
		-moz-box-shadow: 0px 0px 8px 2px #444444;
		box-shadow: 0px 0px 100px 100px #444444;
	}

	.card-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: auto;
		align-items: center;
		justify-items: center;
		align-items: center;
		grid-gap: 5em;
		padding: 5em;
	}
	.center-text {
		text-align: center;
	}

	ul,
	li {
		padding: 5px;
		list-style: square;
		margin-left: 20px;
		text-decoration: none;
	}
</style>
