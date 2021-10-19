<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Nathan Meeker || Experience</title>
</svelte:head>

<div class="experience" class:active={$page.path === `/experience`}>
	<div class="container-border">
		<h1 class="title">Personal and Professional Experience</h1>

		<!-- Set up animation so that all of the balls are rotating with a stop animation on hover. -->
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
	</div>
	<p class="center-text">
		<em>For further details, check out my social media links at the bottom of this page.</em>
	</p>
</div>

<style>
	.container-border {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-content: center;
		margin: 2em;
	}
	.experience {
		position: relative;
		margin: 80px auto;
		/* background-color: var(--light-blue); */
	}

	.title {
		text-align: center;
		text-transform: uppercase;
	}

	.card-sm {
		width: 300px;
		height: 300px;
		padding: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		font-size: 1.3em;
		border-radius: 50%;
		box-shadow: 0px 5px 20px var(--black);
		box-shadow: inset 0px 5px 180px var(--orange);
		cursor: pointer;
		opacity: 0;
		animation: appear 2s linear 1s forwards;
	}

	.card-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: auto;
		align-items: center;
		justify-items: center;
		align-items: center;
		grid-gap: 3em;
	}
	.center-text {
		text-align: center;
	}

	@keyframes appear {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
	ul,
	li {
		padding: 5px;
		list-style: square;
		margin-left: 20px;
		text-decoration: none;
	}
</style>
