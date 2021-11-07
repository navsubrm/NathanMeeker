<script>
	import SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';
	import ExperienceStyles from './ExperienceStyles.svelte';
</script>

<div id="general">
	<SubPageTitleBar title={'General'} colorVar={'white'} textColor={'rgb(238, 174, 37)'} />
	<ExperienceStyles>
		<span slot="image">
			<div class="general-image image" />
		</span>
		<span slot="content">
			<div>
				<h2 class="experience-h2">
					<strong class="experience-strong"
						>More than two decades of professional experience in the US Navy:</strong
					>
				</h2>
				<p class="experience-p">
					The first 16 years I was enlisted, spending seven as a division level manager (Chief Petty
					Officer) where I trained and led teams ranging from 5 to 15 members in submarine
					communications and electronic warfare techniques.
				</p>
				<p class="experience-p">
					Subsequently, I have spent the last decade as an Information Professional Officer,
					evaluating divisional performance across the submarine force. During this time I have
					invested heavily in training divison managers and shipboard department heads on proper
					managment of key programs. Most often my skills were applied to physical and personnel
					security, Communications (COMSEC) security, and Cyber Security with an emphasis on overall
					program management, compliance, and disaster recovery.
				</p>
				<p class="experience-p">
					My project management skills have also extended to shipboard casualty and natural disaster
					response policy. I spent six years leading teams of up to fifty personnel in crisis and
					emergency management where we developed and tested plans for initial response, recovery,
					and contengency operations. I hold multiple certifications and a diverse eduction and
					training background, which demonstrates my adapability and problem solving skills.
				</p>
			</div>
		</span>
	</ExperienceStyles>
</div>

<style>
	.general-image {
		background: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),
			url('/geo_at_sea.jpeg') no-repeat;
		background-size: cover;
	}
</style>
