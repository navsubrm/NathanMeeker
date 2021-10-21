<script>
	import { page } from '$app/stores';
	import { fly, fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>Nathan Meeker || Contact</title>
</svelte:head>

<div in:fly={{ y: -100, duration: 500, delay: 400 }} out:fade>
	<div class="card-layout contact contact-btn" class:card-visible={$page.path === `/contact`}>
		<div class="container-border">
			<h1 class="card-title"><a href="/contact">Contact</a></h1>
			<div id="contact-card" class="card-inner">
				<form action="#" id="contact-form" class="form">
					<label for="first-name">first name:</label>
					<input id="first-name" type="text" size="50" placeholder="First Name" />
					<label for="last-name">last name:</label>
					<input id="last-name" type="text" size="50" placeholder="Last Name" />
					<label for="email"
						>email:
						<span id="email-format" class="alert">entry is not a valid email address.</span></label
					>
					<input id="email" type="text" size="50" placeholder="Email" />
					<label for="message">message:</label>
					<textarea id="message" cols="50" rows="5" placeholder="Enter message here." />
					<span id="message-success" class="alert "
						>Thank you for reaching out to me! I will get back to you shortly.</span
					>
					<span id="message-fail" class="alert"
						>Your message failed to send. Check the information and try again.</span
					>
					<button class="btn btn-main" type="submit" value="submit">send message</button>
				</form>
			</div>
		</div>
	</div>
</div>

<style>
	form {
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-orient: vertical;
		-webkit-box-direction: normal;
		-ms-flex-direction: column;
		flex-direction: column;
		text-transform: uppercase;
		width: 80%;
		margin: auto;
	}

	input,
	textarea {
		padding: 10px;
		margin: 5px;
		font-size: 1em;
		border: none;
		border-radius: 0.2em;
		cursor: pointer;
	}

	.alert {
		font-size: 1.2vmax;
		display: none;
		padding: 5px;
		width: -webkit-fit-content;
		width: -moz-fit-content;
		width: fit-content;
		border-radius: 0.2em;
	}

	.alert-warn {
		-webkit-animation: alertEnter 1s linear forwards;
		animation: alertEnter 1s linear forwards;
		display: inline-block;
		background-color: rgba(242, 242, 24, 0.8);
	}

	.alert-success {
		position: absolute;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-ms-flex-item-align: center;
		align-self: center;
		top: 25%;
		padding: 50px;
		-webkit-animation: msgAlertEnter 7s linear forwards;
		animation: msgAlertEnter 7s linear forwards;
		background-color: rgba(49, 212, 17, 0.8);
	}

	.alert-fail {
		position: absolute;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-ms-flex-item-align: center;
		align-self: center;
		top: 25%;
		padding: 50px;
		-webkit-animation: msgAlertEnter 7s linear forwards;
		animation: msgAlertEnter 7s linear forwards;
		background-color: rgba(237, 24, 24, 0.8);
	}

	@-webkit-keyframes alertEnter {
		0% {
			background-color: none;
			opacity: 0;
		}
		50% {
			opacity: 0.3;
		}
		100% {
			opacity: 1;
			background-color: rgba(242, 242, 24, 0.8);
		}
	}

	@keyframes alertEnter {
		0% {
			background-color: none;
			opacity: 0;
		}
		50% {
			opacity: 0.3;
		}
		100% {
			opacity: 1;
			background-color: rgba(242, 242, 24, 0.8);
		}
	}

	@-webkit-keyframes msgAlertEnter {
		0% {
			opacity: 0;
		}
		15% {
			opacity: 1;
		}
		85% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	@keyframes msgAlertEnter {
		0% {
			opacity: 0;
		}
		15% {
			opacity: 1;
		}
		85% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>
