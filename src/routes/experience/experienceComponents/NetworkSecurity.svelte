<script>
	import SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';
	import ExperienceStyles from './ExperienceStyles.svelte';
</script>

<div id="network-security">
	<SubPageTitleBar title={'Cyber Security'} colorVar={'white'} textColor={'rgb(238, 174, 37)'} />
	<ExperienceStyles>
		<span slot="image">
			<div class="general-image image" />
		</span>
		<span slot="content">
			<h2 class="experience-h2">
				<strong class="experience-strong">More than ten years of Cyber Security Experience:</strong>
			</h2>
			<p class="experience-p">
				My history with Networks and cyber security administration actually starts more than 20
				years ago, with my first role as the admin of a classified network system on my first
				submarine. However, technology and policy have so greatly evolved that those years of simple
				hardware repair, basic user training, and minimal configuration management are
				unrecognizable against modern requirements.
			</p>
			<p class="experience-p">
				In the last twenty years, we have seen an explosion of requirements, increased complexity in
				threats, and an ever growing dependency on cyber-systems. My last ten years have been spent
				observing emerging threats while developing policies and analytics adopted across the
				submarine force by which to measure cyber resilience. As an inspector and mentor of
				shipboard network security teams, I work to evaluate risk and prioritize elements of Navy
				policy to achieve the most robust network posture possible.
			</p>
		</span>
	</ExperienceStyles>
</div>

<style>
	.general-image {
		background: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),
			url('/pexels-pixabay-60504.jpg') no-repeat;
		background: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),
			url('/pexels-pixabay-60504.jpg') no-repeat;
		background-size: cover;
	}
</style>
