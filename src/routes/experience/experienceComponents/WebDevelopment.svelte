<script>
	import SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';
	import ExperienceStyles from './ExperienceStyles.svelte';
</script>

<div id="web-development">
	<SubPageTitleBar title={'Web Development'} colorVar={'white'} textColor={'rgb(238, 174, 37)'} />
	<ExperienceStyles>
		<span slot="image">
			<div class="general-image image" />
		</span>
		<span slot="content">
			<h2 class="experience-h2">
				<strong class="experience-strong"
					>More than five years of Microsoft SharePoint administration:</strong
				>
			</h2>
			<p class="experience-p">
				Far from a SharePoint expert, I have been a quick study and efficiently managed multiple
				sites across three commands. After COVID-19 inhibited traditional office work for an
				extended period, I took a break from my MBA and quickly taught myself HTML, CSS, JavaScript
				and ReactJS to develop custom web solutions to support increased work from home
				requirements. I have developed proficiency with the SP REST API. Recently, I have been
				seeking a mentor that would assist me with improving my SharePoint and development skills.
				If you stumbled across this site and happen to be interested in mentoring, please contact
				me. This site has been developed using Svelte, which I have found to be the most efficient
				framework I have used thus far.
			</p>
			<p class="experience-p">
				My enthusiasm for development has continued to grow. I have built apps for tracking
				personnel security clearance data, command onboarding programs, a small submarine
				communication simulator, and some other personal projects, which I can share from my <a
					class="experience-a"
					href="https://github.com/navsubrm">GitHub</a
				>
				if you are interested. I keep most of my work private due to its purpose, but if you ask and
				I can verify you, I would be happy to let you view the code.
			</p>
		</span>
	</ExperienceStyles>
</div>

<style>
	.general-image {
		background: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),
			url('/pexels-pixabay-270373.jpg') no-repeat;
		background: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),
			url('/pexels-pixabay-270373.jpg') no-repeat;
		background-size: cover;
	}
</style>
