<script>
	import SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';
	import ExperienceStyles from './ExperienceStyles.svelte';
</script>

<div id="education">
	<SubPageTitleBar title={'Education'} colorVar={'white'} textColor={'rgb(238, 174, 37)'} />
	<ExperienceStyles>
		<span slot="image">
			<div class="general-image experience-image">
				<h2>Knowledge is Power!</h2>
			</div>
		</span>
		<span slot="content">
			<div>
				<h2 class="experience-h2">
					<strong class="experience-strong">Professional Certifications/Education:</strong>
				</h2>
				<p class="experience-p">
					I hold civilian and Department of Defense certifications in Cyber, Personnel and Physical
					Security along with a Bachelor's degree in Business Administration from Excelsior College.
					I am currently four classes from completing an MBA with an emphasis in
					Technology/Innovation Management.
				</p>
				<h2 class="experience-h2">
					<strong class="experience-strong"
						>Security Professional Education and Development (SPeD) certifications:</strong
					>
				</h2>
				<ul class="experience-ul">
					<li class="experience-li">
						<a
							class="experience-a"
							title="Center for Security Excellence SFPC certification webpage."
							href="https://www.cdse.edu/certification/sfpc.html"
							>Security Professional Fundamentals (SFPC) 3+ years</a
						>
					</li>
					<li class="experience-li">
						<a
							class="experience-a"
							title="Center for Security Excellence PSC certification webpage."
							href="https://www.cdse.edu/certification/psc.html"
							>Physical Security Certification (PSC) 3+ years</a
						>
					</li>
				</ul>
				<h2 class="experience-h2">
					<strong class="experience-strong">Additional Military Training:</strong>
				</h2>
				<ul class="experience-ul">
					<li class="experience-li">
						Navy Communications Security Management System <a
							class="experience-a"
							title="Navy COMSEC Management System webpage."
							href="https://www.navifor.usff.navy.mil/ncms/">(NCMS)</a
						> certified inspector 10+ years
					</li>
					<li class="experience-li">Information Systems Security Manager 7+ years</li>
					<li class="experience-li">Operational Security Officer 5+ years</li>
					<li class="experience-li">Emergency Management Officer 5+ years</li>
					<li class="experience-li">Classified Material Control Officer 10+ years</li>
					<li class="experience-li">Command Equal Opportunity Officer 2+ years</li>
				</ul>
				<h2 class="experience-h2">
					<strong class="experience-strong">Non-military Education:</strong>
				</h2>
				<ul class="experience-ul">
					<li class="experience-li">Bachelor's degree in Business Administration (2015)</li>
					<li class="experience-li">COMPTIA Security+ (2015)</li>
					<li class="experience-li">
						Sigma Beta Delta National Honor Society for Business (2019).
					</li>
				</ul>
			</div>
		</span>
	</ExperienceStyles>
</div>

<style>
	.general-image {
		display: flex;
		justify-content: center;
		align-items: center;
		background: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.9));
		background-size: cover;
	}
	.general-image > h2 {
		font-family: 'Gochi Hand', cursive;
		font-size: 4em;
		text-align: center;
		color: var(--experience-text);
	}

	@media only screen and (max-width: 1500px) {
		.general-image {
			height: 20vmax;
			width: 60vmax;
		}
	}

	@media only screen and (max-width: 850px) {
		.general-image {
			height: 15vmax;
			width: 25vmax;
		}
		.general-image > h2 {
			font-size: 2em;
		}
	}
</style>
