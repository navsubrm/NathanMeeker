<script>
	import SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';

	const scrollTop = () => window.scrollTo(0, 0);
</script>

<div id="general">
	<SubPageTitleBar title={'General'} colorVar={'rgb(238, 174, 37)'} />
	<div class="container">
		<div class="image" />
		<div class="content">
			<div>
				<strong>More than two decades of professional experience in the US Navy:</strong>
				<p>
					The first 16 years I was enlisted, spending seven as a division level manager (Chief Petty
					Officer) where I trained and led teams ranging from 5 to 15 members in submarine
					communications and electronic warfare techniques.
				</p>
				<p>
					Subsequently, I have spent the last decade as an Information Professional Officer,
					evaluating divisional performance across the submarine force. During this time I have
					invested heavily in training divison managers and shipboard department heads on proper
					managment of key programs. Most often my skills were applied to physical and personnel
					security, Communications (COMSEC) security, and Cyber Security with an emphasis on overall
					program management, compliance, and disaster recovery.
				</p>
				<p>
					My project management skills have also extended to shipboard casualty and natural disaster
					response policy. I spent six years leading teams of up to fifty personnel in crisis and
					emergency management where we developed and tested plans for initial response, recovery,
					and contengency operations. I hold multiple certifications and a diverse eduction and
					training background, which demonstrates my adapability and problem solving skills.
				</p>
			</div>
		</div>
	</div>
	<button class="btn btn-main btn-center" on:click={scrollTop}>Scroll Top</button>
</div>

<style>
	.container {
		position: relative;
		display: grid;
		place-items: center;
		grid-template-areas: 'text text image';
		min-height: 70vh;
		margin: 20px auto 0px auto;
		padding: 2em;
	}
	.image {
		grid-area: image;
		height: 25vmax;
		width: 40vmax;
		background: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),
			url('/geo_at_sea.jpeg') no-repeat;
		background: linear-gradient(rgba(238, 174, 37, 0.6), rgba(63, 238, 230, 0.7)),
			url('/geo_at_sea.jpeg') no-repeat;
		background-size: cover;
		margin: 20px;
	}
	.content {
		grid-area: text;
		width: clamp(400px, 100%, 900px);
		font-size: 1.5em;
	}
	p,
	strong {
		margin: 40px auto 40px auto;
		line-height: 2em;
		color: var(--experience-text);
	}

	@media only screen and (max-width: 1500px) {
		.container {
			grid-template-areas:
				'image'
				'text';
			padding: 5px;
		}
		.image {
			height: 50vmax;
			width: 90vmax;
		}
	}
</style>
