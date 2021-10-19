<script lang="ts">
	import { page } from '$app/stores';

	$: if ($page.path !== '/')
		document.documentElement.style.setProperty('--sub-container-diagonal', `0rad`);
</script>

<div class="title-container">
	<div class="nav">
		<!-- Make the nav bar sticky to hold it at the top of the page.-->
		<nav class="nav-menu">
			<ul>
				<li><a class="nav-link home-btn" href="/">home</a></li>
				<li><a class="nav-link experience-btn" href="/experience">experience</a></li>
				<li><a class="nav-link about-btn" href="/about">about</a></li>
				<li><a class="nav-link contact-btn" href="/contact">contact</a></li>
			</ul>
		</nav>
	</div>
</div>

<style>
	.nav {
		position: absolute;
		top: 0;
		width: 100%;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		z-index: 1;
		background-color: white;
	}

	.nav-menu {
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		width: 100%;
		-webkit-box-pack: end;
		-ms-flex-pack: end;
		justify-content: flex-end;
	}

	.nav-menu ul,
	.nav-menu li {
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-orient: horizontal;
		-webkit-box-direction: normal;
		-ms-flex-direction: row;
		flex-direction: row;
		margin: 10px 20px;
		-ms-flex-wrap: wrap;
		flex-wrap: wrap;
		-ms-flex-line-pack: space-evenly;
		align-content: space-evenly;
	}

	.nav-menu a {
		text-decoration: none;
	}

	.nav-link {
		padding: 5px 7px;
		border-radius: 0.7em;
		border: transparent 2px #222121;
		color: #222121;
		-webkit-transition: border 0.5s;
		transition: border 0.5s;
		-webkit-transition: color 0.5s;
		transition: color 0.5s;
	}

	.nav-link:hover {
		border: solid 2px;
		color: #222121;
		cursor: pointer;
	}

	.nav-link:active {
		background-color: #cafafe;
	}

	.nav-link:focus {
		border: solid;
		outline: none;
	}

	.nav-link:inner-focus {
		outline: none;
	}

	@media only screen and (max-width: 600px) {
		.nav-menu {
			-webkit-box-pack: center;
			-ms-flex-pack: center;
			justify-content: center;
		}
	}
	@media only screen and (max-width: 400px) {
		.nav ul li {
			-webkit-box-pack: space-evenly;
			-ms-flex-pack: space-evenly;
			justify-content: space-evenly;
			-ms-flex-wrap: wrap;
			flex-wrap: wrap;
			margin: 10px 0px;
		}
	}

	@media only screen and (max-width: 600px) {
		.nav ul li {
			margin: 10px 0px;
		}
	}
</style>
