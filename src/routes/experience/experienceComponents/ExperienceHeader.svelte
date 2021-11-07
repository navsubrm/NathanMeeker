<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';
	import GlobeText from './GlobeText.svelte';
</script>

<div in:fly={{ y: -100, duration: 500, delay: 400 }} out:fade>
	<SubPageTitleBar title={'experience'} colorVar={'white'} textColor={'rgb(238, 174, 37)'} />
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
				<!--  The route should mirror the div ID that you want the scroll to go to in globeText -->
				<GlobeText totalTitleLetters={14} spread={110} route={'#network-security'}>
					<span slot="title">
						<span style="--rot-posit:-6;">c</span>
						<span style="--rot-posit:-5;">y</span>
						<span style="--rot-posit:-4;">b</span>
						<span style="--rot-posit:-3;">e</span>
						<span style="--rot-posit:-2;">r</span>
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
				</GlobeText>
			</div>
			<div class="three">
				<GlobeText totalTitleLetters={15} spread={100} route={'#web-development'}>
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
				</GlobeText>
			</div>
			<div class="four">
				<GlobeText totalTitleLetters={19} spread={120} route={'#security-management'}>
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
				</GlobeText>
			</div>
			<div class="five">
				<GlobeText totalTitleLetters={9} spread={60} route={'#education'}>
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
