<script>
	import SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';
	import ExperienceStyles from './ExperienceStyles.svelte';
</script>

<div id="security-management">
	<SubPageTitleBar
		title={'Security Management'}
		colorVar={'white'}
		textColor={'rgb(238, 174, 37)'}
	/>
	<ExperienceStyles>
		<span slot="image">
			<div class="general-image experience-image" />
		</span>
		<span slot="content">
			<h2 class="experience-h2">
				<strong class="experience-strong"
					>More than 20 years of Physical and Personnel Security Experience:</strong
				>
			</h2>
			<p class="experience-p">
				Physical, personnel, and information security management has been a focus of my entire
				military serivce. Most of my career has involved acting as an assistant or command security
				manager in some form. The last ten years, I have been the head security officer in each
				assignment. During this time, I have managed tens of thousands of requests for access to
				classified materiels and facilities, managed background investigations, oversaw inquires to
				security violations and incidents, certified secure facilities, and developed security
				policy.
			</p>
			<p class="experience-p">
				I have managed small and large projects reducing cost, waste, and improving classified
				materiel management. From producing clean alternative energy by transitioning destruction
				processes to waste-to-energy conversion facilities to larger facility modificaitons, I am
				passionate about finding innovative security solutions.
			</p>
			<p class="experience-p">
				In 2018, I completed the Department of Defense Security Professional Education Development
				(SPeD) ceritifications for Security Fundamentals Professional and Physical Security.
				<a
					class="experience-a"
					href="https://www.cdse.edu/Certification/About-SPēD-Certification/"
					title="SPeD about page">Click here for details on the SPeD program.</a
				>
			</p>
		</span>
	</ExperienceStyles>
</div>

<style>
	.general-image {
		height: 30vmax;
		width: 25vmax;
		background: linear-gradient(rgba(238, 174, 37, 0.4), rgba(63, 238, 230, 0.6)),
			url('/Loose_lips_might_sink_ships.jpeg') no-repeat;
		background-size: cover;
		background-position: center;
		margin: 20px;
		border-radius: 0.9em;
		box-shadow: inset 0 0 40px var(--shadow-color), 5px 10px 25px var(--experience-text);
	}

	@media only screen and (max-width: 1500px) {
		.general-image {
			height: 30vmax;
			width: 25vmax;
		}
	}

	@media only screen and (max-width: 850px) {
		.general-image {
			height: 30vmax;
			width: 20vmax;
			transform: translateY(0);
		}
	}
</style>
