<script lang="ts">
	import SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';
	import AboutStyles from './AboutStyles.svelte';
</script>

<div>
	<SubPageTitleBar title={'bluf'} colorVar={'white'} textColor={'var(--blue)'} />
	<AboutStyles>
		<span slot="image">
			<div class="local-image image" />
		</span>
		<span slot="content">
			<p class="about-p">
				I am a 24 year Navy veteran with a passion for finding and applying data-driven solutions to
				improve business outcomes. In my years of service I have developed a passion for life-long
				learning and watching technology trends for ways to improve productivity, quality of work,
				and quality of life.
			</p>
		</span>
	</AboutStyles>
</div>

<style>
	.local-image {
		background: linear-gradient(rgba(49, 82, 80, 0.609), rgba(63, 238, 230, 0.7)),
			url('/IMG_0261.png') no-repeat;
		background-size: contain;
		background-position: bottom;
		height: 35vmax;
		width: 25vmax;
	}
</style>
