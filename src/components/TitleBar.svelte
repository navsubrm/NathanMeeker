<script>
</script>

<div class="title">
	<div>
		<div class="animated-text">
			<div class="title-block">
				<span class="title-main gradient-text">Nathan Meeker</span>
				<span class="title-secondary gradient-text">Come See the Whole Picture</span>
				<!--<a href="#" tabindex="4" class="btn btn-main"> Contact me </a>-->
			</div>
		</div>
	</div>
</div>

<style>
	.title {
		position: relative;
		height: 95vh;
		background-image: -webkit-gradient(
				linear,
				left top,
				right top,
				from(rgba(85, 188, 201, 0.3)),
				to(rgba(63, 238, 230, 0.9))
			),
			url('/IMG_1521.jpeg');
		background-image: linear-gradient(to right, rgba(85, 188, 201, 0.3), rgba(63, 238, 230, 0.9)),
			url('/IMG_1521.jpeg');
		background-repeat: no-repeat;
		background-size: cover;
		-webkit-animation: pictureReveal 1.5s linear 2s;
		animation: pictureReveal 1.5s linear 2s;
		-webkit-animation-fill-mode: backwards;
		animation-fill-mode: backwards;
		-webkit-clip-path: polygon(0 0, 100% 0, 100% 79%, 0 100%);
		clip-path: polygon(0 0, 100% 0, 100% 79%, 0 100%);
	}

	.title-block {
		position: absolute;
		top: 40%;
		left: 50%;
		width: 100%;
		-webkit-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
		text-align: center;
	}

	.title-main {
		background-color: #1f2b62;
		background-image: linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);
		background-repeat: no-repeat;
		background-size: 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
		text-transform: uppercase;
		display: block;
		font-size: 8vmax;
		-webkit-animation: titleSwoop 1.5s linear;
		animation: titleSwoop 1.5s linear;
	}

	.title-secondary {
		background-color: #1f2b62;
		background-image: linear-gradient(43deg, #1f2b62 0%, #9a1f92 51%, #120d45 94%, #ffffff 100%);
		background-repeat: no-repeat;
		background-size: 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		-webkit-text-fill-color: transparent;
		text-transform: uppercase;
		display: block;
		line-height: 1.5rem;
		letter-spacing: 0.65rem;
		font-size: 1.5vmax;
		margin-bottom: 40px;
		text-align: center;
		-webkit-animation: subTitleSwoop 1.5s linear 3s;
		animation: subTitleSwoop 1.5s linear 3s;
		-webkit-animation-fill-mode: backwards;
		animation-fill-mode: backwards;
	}

	@-webkit-keyframes pictureReveal {
		0% {
			background-image: -webkit-gradient(linear, left top, right top, from(#55bcc9), to(#3feee6)),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, #55bcc9, #3feee6), url('/IMG_1521.jpeg');
		}
		25% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.8)),
					to(rgba(63, 238, 230, 0.97))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.8), rgba(63, 238, 230, 0.97)),
				url('/IMG_1521.jpeg');
		}
		50% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.6)),
					to(rgba(63, 238, 230, 0.95))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.6), rgba(63, 238, 230, 0.95)),
				url('/IMG_1521.jpeg');
		}
		75% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.4)),
					to(rgba(63, 238, 230, 0.93))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.4), rgba(63, 238, 230, 0.93)),
				url('/IMG_1521.jpeg');
		}
		100% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.3)),
					to(rgba(63, 238, 230, 0.9))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.3), rgba(63, 238, 230, 0.9)),
				url('/IMG_1521.jpeg');
		}
	}

	@keyframes pictureReveal {
		0% {
			background-image: -webkit-gradient(linear, left top, right top, from(#55bcc9), to(#3feee6)),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, #55bcc9, #3feee6), url('/IMG_1521.jpeg');
		}
		25% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.8)),
					to(rgba(63, 238, 230, 0.97))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.8), rgba(63, 238, 230, 0.97)),
				url('/IMG_1521.jpeg');
		}
		50% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.6)),
					to(rgba(63, 238, 230, 0.95))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.6), rgba(63, 238, 230, 0.95)),
				url('/IMG_1521.jpeg');
		}
		75% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.4)),
					to(rgba(63, 238, 230, 0.93))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.4), rgba(63, 238, 230, 0.93)),
				url('/IMG_1521.jpeg');
		}
		100% {
			background-image: -webkit-gradient(
					linear,
					left top,
					right top,
					from(rgba(85, 188, 201, 0.3)),
					to(rgba(63, 238, 230, 0.9))
				),
				url('/IMG_1521.jpeg');
			background-image: linear-gradient(to right, rgba(85, 188, 201, 0.3), rgba(63, 238, 230, 0.9)),
				url('/IMG_1521.jpeg');
		}
	}

	@-webkit-keyframes titleSwoop {
		0% {
			width: 100vw;
			letter-spacing: 3rem;
			opacity: 0;
		}
		100% {
			width: 100vw;
			letter-spacing: 2px;
			opacity: 1;
		}
	}

	@keyframes titleSwoop {
		0% {
			width: 100vw;
			letter-spacing: 3rem;
			opacity: 0;
		}
		100% {
			width: 100vw;
			letter-spacing: 2px;
			opacity: 1;
		}
	}

	@-webkit-keyframes subTitleSwoop {
		0% {
			-webkit-transform: translateY(-60px);
			transform: translateY(-60px);
			opacity: 0;
		}
		100% {
			-webkit-transform: translateY(0px);
			transform: translateY(0px);
			opacity: 1;
		}
	}

	@keyframes subTitleSwoop {
		0% {
			-webkit-transform: translateY(-60px);
			transform: translateY(-60px);
			opacity: 0;
		}
		100% {
			-webkit-transform: translateY(0px);
			transform: translateY(0px);
			opacity: 1;
		}
	}
</style>
