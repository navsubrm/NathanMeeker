<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import SubPageTitleBar from '../components/SubPageTitleBar.svelte';
</script>

<svelte:head>
	<title>Nathan Meeker || Experience</title>
</svelte:head>

<div in:fly={{ y: -100, duration: 500, delay: 400 }} out:fade>
	<SubPageTitleBar title={'experience'} colorVar={'rgb(238, 174, 37)'} />
	<div class="container-border">
		<div class="card-container">
			<div class="card-frame one">
				<div class="card-sm">
					<div class="perspective">
						<h1 class="text">General Experience</h1>
					</div>
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
			</div>
			<div class="card-sm two">
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
			<div class="card-sm three">
				<h1>Network Administration</h1>
			</div>
			<div class="card-sm four">
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
			<div class="card-sm five">
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
			<div class="card-sm six">
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
	.card-frame {
		width: 400px;
		height: 400px;
		margin: 200px;
		perspective: 400px;
		perspective-origin: 50% 50%;
		position: relative;
	}

	.perspective {
		transform-style: preserve-3d;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate3d(-50%, -50%, 0);
	}

	.text {
		font-size: 1.5em;
		-webkit-backface-visibility: hidden;
		-moz-backface-visibility: hidden;
		backface-visibility: hidden;
		animation: rotate 6s linear infinite;
	}
	.text:hover {
		transform: rotateY(0deg) translateZ(200px);
		animation-play-state: paused;
		-o-animation-play-state: paused;
		-webkit-animation-play-state: paused;
		-moz-animation-play-state: paused;
	}

	.card-sm {
		position: relative;
		width: 300px;
		height: 300px;
		padding: 30px;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		font-size: 1.3em;
		border-radius: 50%;
		box-shadow: inset 0px 5px 380px var(--orange), inset 0px 5px 60px rgb(10, 10, 10);
		cursor: pointer;
		z-index: 2;
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
		grid-template-areas:
			'. one two .'
			'six . . three'
			'. five four .';
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(3, fit-content);
		align-items: center;
		justify-items: center;
		width: fit-content;
		margin: 20px auto 60px auto;
		grid-gap: 3em;
	}

	.one {
		grid-area: one;
		grid-column: 2/3;
	}
	.two {
		grid-area: two;
		grid-column: 3/4;
	}
	.three {
		grid-area: three;
		grid-column: 3/5;
	}
	.four {
		grid-area: four;
		grid-column: 3/4;
	}
	.five {
		grid-area: five;
		grid-column: 2/3;
	}
	.six {
		grid-area: six;
		grid-column: 1/3;
	}
	.center-text {
		text-align: center;
		padding: 15px;
		font-weight: 400;
		font-size: 1.5em;
	}

	ul,
	li {
		padding: 5px;
		list-style: square;
		margin-left: 20px;
		text-decoration: none;
	}

	@keyframes rotate {
		from {
			transform: rotateY(0deg) translateZ(200px);
		}
		to {
			transform: rotateY(360deg) translateZ(200px);
		}
	}
</style>
