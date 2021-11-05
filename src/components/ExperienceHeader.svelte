<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import SubPageTitleBar from './SubPageTitleBar.svelte';
	import GlobeText from './GlobeText.svelte';
</script>

<div in:fly={{ y: -100, duration: 500, delay: 400 }} out:fade>
	<SubPageTitleBar title={'experience'} colorVar={'rgb(238, 174, 37)'} />
	<div class="container-border">
		<div class="card-container">
			<div class="one">
				<!-- This is a component load for the globe animations -->
				<GlobeText totalTitleLetters={7} spread={50} route={'#general'}>
					<span slot="title">
						<!--  Note the span with slot name It identifies which slot -->
						<span style="--rot-posit:-3;">g</span>
						<span style="--rot-posit:-2;">e</span>
						<span style="--rot-posit:-1;">n</span>
						<span style="--rot-posit:0;">e</span>
						<span style="--rot-posit:1;">r</span>
						<span style="--rot-posit:2;">a</span>
						<span style="--rot-posit:3;">l</span>
					</span>
				</GlobeText>
				<!-- End of the first globe animation -->
			</div>
			<div class="two">
				<GlobeText totalTitleLetters={18} spread={120} route={'/'}>
					<span slot="title">
						<span style="--rot-posit:-8;">n</span>
						<span style="--rot-posit:-7;">e</span>
						<span style="--rot-posit:-6;">t</span>
						<span style="--rot-posit:-5;">w</span>
						<span style="--rot-posit:-4;">o</span>
						<span style="--rot-posit:-3;">r</span>
						<span style="--rot-posit:-2;">k</span>
						<span style="--rot-posit:-1;" />
						<span style="--rot-posit:0;">s</span>
						<span style="--rot-posit:1;">e</span>
						<span style="--rot-posit:2;">c</span>
						<span style="--rot-posit:3;">u</span>
						<span style="--rot-posit:4;">r</span>
						<span style="--rot-posit:5;">i</span>
						<span style="--rot-posit:6;">t</span>
						<span style="--rot-posit:7;">y</span>
					</span>
					<span slot="sub-items">
						<div>
							<strong
								>Information Systems Security Manager / Network administrator 10+ years:</strong
							>
							<ul>
								<li>COMPTIA Security+ certified 7+ years.</li>
								<li>MS SharePoint Administrator 5+ years.</li>
								<li>MS SharePoint development 2+ years.</li>
								<li>Proficient with HTML, CSS, JavaScript, and React.</li>
							</ul>
						</div>
					</span>
				</GlobeText>
			</div>
			<div class="three">
				<GlobeText totalTitleLetters={15} spread={100} route={'/'}>
					<span slot="title">
						<span style="--rot-posit:-7;">w</span>
						<span style="--rot-posit:-6;">e</span>
						<span style="--rot-posit:-5;">b</span>
						<span style="--rot-posit:-4;" />
						<span style="--rot-posit:-3;">d</span>
						<span style="--rot-posit:-2;">e</span>
						<span style="--rot-posit:-1;">v</span>
						<span style="--rot-posit:0;">e</span>
						<span style="--rot-posit:1;">l</span>
						<span style="--rot-posit:2;">o</span>
						<span style="--rot-posit:3;">p</span>
						<span style="--rot-posit:4;">m</span>
						<span style="--rot-posit:5;">e</span>
						<span style="--rot-posit:6;">n</span>
						<span style="--rot-posit:7;">t</span>
					</span>
					<span slot="sub-items">
						<div>
							<ul>
								<li>COMPTIA Security+ certified 7+ years.</li>
								<li>MS SharePoint Administrator 5+ years.</li>
								<li>MS SharePoint development 2+ years.</li>
								<li>Proficient with HTML, CSS, JavaScript, and React.</li>
							</ul>
						</div>
					</span>
				</GlobeText>
			</div>
			<div class="four">
				<GlobeText totalTitleLetters={19} spread={120} route={'/'}>
					<span slot="title">
						<span style="--rot-posit:-9;">s</span>
						<span style="--rot-posit:-8;">e</span>
						<span style="--rot-posit:-7;">c</span>
						<span style="--rot-posit:-6;">u</span>
						<span style="--rot-posit:-5;">r</span>
						<span style="--rot-posit:-4;">i</span>
						<span style="--rot-posit:-3;">t</span>
						<span style="--rot-posit:-2;">y</span>
						<span style="--rot-posit:-1;" />
						<span style="--rot-posit:0;">m</span>
						<span style="--rot-posit:1;">a</span>
						<span style="--rot-posit:2;">n</span>
						<span style="--rot-posit:3;">a</span>
						<span style="--rot-posit:4;">g</span>
						<span style="--rot-posit:5;">e</span>
						<span style="--rot-posit:6;">m</span>
						<span style="--rot-posit:7;">e</span>
						<span style="--rot-posit:8;">n</span>
						<span style="--rot-posit:9;">t</span>
					</span>
					<span slot="sub-items">
						<div>
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
					</span>
				</GlobeText>
			</div>
			<div class="five">
				<GlobeText totalTitleLetters={9} spread={60} route={'/'}>
					<span slot="title">
						<span style="--rot-posit:-5;">c</span>
						<span style="--rot-posit:-4;">r</span>
						<span style="--rot-posit:-3;">e</span>
						<span style="--rot-posit:-2;">d</span>
						<span style="--rot-posit:-1;">e</span>
						<span style="--rot-posit:0;">n</span>
						<span style="--rot-posit:1;">t</span>
						<span style="--rot-posit:2;">i</span>
						<span style="--rot-posit:3;">a</span>
						<span style="--rot-posit:4;">l</span>
						<span style="--rot-posit:5;">s</span>
					</span>
					<span slot="sub-items">
						<div>
							<strong
								>Bachelor's degree in Business Administration from Excelsior College. (2015).</strong
							>
							<strong
								>12 semester hours from completing an MBA with emphasis in technology management.</strong
							>
							<strong>Sigma Beta Delta National Honor Society for Business (2019).</strong>
						</div>
					</span>
				</GlobeText>
			</div>
		</div>
		<p class="center-text">
			<em>You can also check out my social media links at the bottom of this page.</em>
		</p>
	</div>
</div>

<style>
	.card-container {
		display: flex;
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
		width: 100%;
		margin: 10px auto 10px auto;
	}

	.center-text {
		text-align: center;
		padding: 15px;
		font-weight: 400;
		font-size: 1.5em;
	}
</style>
