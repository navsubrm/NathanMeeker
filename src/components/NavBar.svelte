<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="nav">
	<!-- Make the nav bar sticky to hold it at the top of the page.-->
	<nav class="nav-menu">
		<ul>
			<li class="nav-link" class:active={$page.path === `/`}><a href="/">home</a></li>
			<li class="nav-link" class:active={$page.path === `/experience`}>
				<a href="/experience">experience</a>
			</li>
			<li class="nav-link"><a href="/about" class:active={$page.path === `/about`}>about</a></li>
			<li class="nav-link">
				<a href="/contact" class:active={$page.path === `/contact`}>contact</a>
			</li>
		</ul>
	</nav>
</div>

<style>
	.active {
		border-bottom: solid 1px black;
	}
	.nav {
		position: sticky;
		top: 0;
		width: 100%;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		min-height: 5vh;
		z-index: 10;
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
		margin: 5px 20px;
		-ms-flex-wrap: wrap;
		flex-wrap: wrap;
		-ms-flex-line-pack: space-evenly;
		align-content: space-evenly;
	}

	.nav-menu a {
		text-decoration: none;
		font-weight: 700;
		text-transform: uppercase;
	}

	.nav-link {
		padding: 5px 7px;
		border: transparent 2px #222121;
		color: #222121;
		-webkit-transition: border 0.5s;
		transition: border 0.5s;
		-webkit-transition: color 0.5s;
		transition: color 0.5s;
	}

	.nav-link:hover {
		border: solid 2px;
		border-radius: 0.25em;
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
