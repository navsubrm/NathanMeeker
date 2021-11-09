<script lang="ts">
	import SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';
	import AboutStyles from './AboutStyles.svelte';
</script>

<div>
	<SubPageTitleBar title={'Summary'} colorVar={'white'} textColor={'var(--blue)'} />
	<AboutStyles>
		<span slot="image">
			<div class="local-image about-image" />
		</span>
		<span slot="content">
			<p class="about-p">
				I am a 24 year Navy veteran with a passion for finding and applying data-driven solutions to
				improve business outcomes. During my life, I have developed a passion for life-long
				learning, efficiency, and developing the best data-driven solutions to improve productivity,
				quality of work, and quality of life. I believe we can work smart, get it done, and still
				have time for the ones we love the most.
			</p>
		</span>
	</AboutStyles>
</div>

<style>
	.local-image {
		background: linear-gradient(rgba(49, 82, 80, 0.309), rgba(63, 238, 230, 0.5)),
			url('/UPLOAD 2.png') no-repeat;
		background-size: contain;
		background-position: bottom;
		height: 28vmax;
		width: 20vmax;
	}
</style>
