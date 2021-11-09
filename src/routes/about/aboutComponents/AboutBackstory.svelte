<script lang="ts">
	import SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';
	import AboutStyles from './AboutStyles.svelte';
</script>

<div>
	<SubPageTitleBar title={'backstory'} colorVar={'white'} textColor={'var(--blue)'} />
	<AboutStyles>
		<span slot="image">
			<div class="local-image about-image" />
		</span>
		<span slot="content">
			<p class="about-p">
				Born and raised a California boy, I enlisted in the Navy in 1997 as a
				<a
					class="about-a"
					title="Submarine Communications Electronics Technician description."
					href="https://www.careersinthemilitary.com/service-career-detail/navy/electrical-instrument-and-equipment-repairers/electronics-technician--submarine--communications"
					>Submarine Electronics Technician (Communications).</a
				>
				After 9 years, I promoted to Chief Petty Officer, and after 16 years commissioned as a
				<a
					class="about-a"
					title="Submarine Communications Limited Duty Officer (LDO) description."
					href="https://www.cool.osd.mil/usn/officer/odc629x.htm"
					>Submarine Communications Limited Duty Officer</a
				>. In 2015, I completed my Bachelor's degree in Business Administration from Excelsior
				College. After completing My Information Warfare Officer qualification in 2016, I
				redesignated to the
				<a
					class="about-a"
					title="Information Professional Corps description."
					href="https://www.navy.com/careers/information-professional"
					>Information Professional Corp</a
				>. During the same time I was working on my Technology/Innovation Management MBA. However, I
				took 2020 off due to the COVID-19 pandemic. In that time I taught myself web-development to
				support changing workplace requirements. At the start of 2021, I re-engaged on my MBA and
				continue to serve in the US Navy. I have four classes left, and intend to finish in the near
				future. I am currently working and living in Washington State enjoying the Pacific Northwest
				with my wife and four daughters.
			</p>
		</span>
	</AboutStyles>
</div>

<style>
	.local-image {
		background: linear-gradient(rgba(49, 82, 80, 0.309), rgba(63, 238, 230, 0.5)),
			url('/FS0A5054.png') no-repeat;
		background-size: cover;
	}
</style>
