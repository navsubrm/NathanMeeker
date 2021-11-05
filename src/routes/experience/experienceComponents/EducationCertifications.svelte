<script>
	import SubPageTitleBar from '../../../components/SubPageTitleBar.svelte';

	const scrollTop = () => window.scrollTo(0, 0);
</script>

<div id="education">
	<SubPageTitleBar title={'Certifications & Education'} colorVar={'rgb(238, 174, 37)'} />
	<div class="container">
		<div class="image" />
		<div class="content">
			<div>
				<p>
					<strong>Professional Certifications/Education:</strong>
				</p>
				<p>
					I hold civilian and Department of Defense certifications in Cyber, Personnel and Physical
					Security along with a Bachelor's degree in Business Administration from Excelsior College.
					I am currently four classes from completing an MBA with an emphasis in
					Technology/Innovation Management.
				</p>
				<p>
					<strong>Security Professional Education and Development (SPeD) certifications:</strong>
				</p>
				<ul>
					<li />
					<li>Security Professional Fundamentals (SPFC) 3+ years.</li>
					<li>Physical Security (PSC) 3+ years.</li>
					<li>
						Navy Communications Security Management System <a
							title="Navy COMSEC Management System webpage."
							href="https://www.navifor.usff.navy.mil/ncms/">(NCMS)</a
						> certified inspector 10+ years.
					</li>
				</ul>
				<p>
					<strong>Non-military Education:</strong>
				</p>
				<ul>
					<li>Bachelor's degree in Business Administration</li>
					<li>COMPTIA Security+</li>
					<li>Sigma Beta Delta Honor Society member</li>
				</ul>
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
		grid-template-areas: 'image text text';
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
