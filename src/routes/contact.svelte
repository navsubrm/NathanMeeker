<script lang="ts">
	import { page } from '$app/stores';
	import { fly, fade } from 'svelte/transition';
	import emailValidator from 'email-validator';
	import dompurify from 'dompurify';
	import emailjsCom from 'emailjs-com';
	import SubPageTitleBar from '../components/SubPageTitleBar.svelte';

	//Handle contact form:
	emailjsCom.init('user_RoDNRpp8DGk61m380dPFq');
	//DOM elements for contact form:
	let fName: string;
	let lName: string;
	let email: string;
	let message: string;

	//Error Elements:
	let emailFormat: HTMLSpanElement;
	let messageSuccess: HTMLSpanElement;
	let messageFail: HTMLSpanElement;

	//Form variables:
	let alertTimer;

	// Check email address to confirm it is a real address
	const validateEmail = () => {
		if (email === null || email === '') return;
		if (!emailValidator.validate(email)) return emailFormat.classList.add('alert-warn');
		emailFormat.classList.remove('alert-warn');
	};

	//Check if field is blank and add alert.
	const validateBlankField = (e) => {
		const actionItem = document.querySelector(`#${e.target.getAttribute('id')}`) as
			| HTMLInputElement
			| HTMLTextAreaElement;
		if (e.target.value === null || e.target.value === '' || !e.target.value) {
			actionItem.classList.add('alert-warn');
			actionItem.placeholder = 'Field required to submit';
		}
	};

	//Reset field on focus
	const clearInvalidation = (e, placeholder: string) => {
		const actionItem = document.querySelector(`#${e.target.getAttribute('id')}`) as
			| HTMLInputElement
			| HTMLTextAreaElement;
		actionItem.classList.remove('alert-warn');
		actionItem.placeholder = placeholder;
	};

	//Allows for typing before the email error alert will show.
	const keyEventValidator = (callback: CallableFunction) => {
		clearTimeout(alertTimer);
		alertTimer = setTimeout(() => callback(), 1500);
	};

	//Verify that only allowable text is entered into fields.
	const inputValidator = (input) => {
		let sanitizedInput = dompurify.sanitize(input);
		if (sanitizedInput.includes('Field required to submit') || sanitizedInput === '') return true;
	};

	const validateMessageContents = () => {
		let invalidContents = 0;
		if (inputValidator(fName)) invalidContents++;
		if (inputValidator(lName)) invalidContents++;
		if (!emailValidator.validate(email)) invalidContents++;
		if (inputValidator(message)) invalidContents++;
		if (invalidContents === 0) return true;
	};

	const messageSubmit = (e) => {
		e.preventDefault();
		if (validateMessageContents()) {
			emailjsCom
				.send('service_0wgxmn4', 'template_u9mwv2n', {
					from_name: `${fName} ${lName}`,
					from_email: `${email}`,
					message: dompurify.sanitize(message)
				})
				.then(
					function (response) {
						//add alert class for success or failure
						messageSuccess.classList.add('alert-success');
						setTimeout(() => messageSuccess.classList.remove('alert-success'), 7000);
					},
					function (err) {
						messageFail.classList.add('alert-fail');
						setTimeout(() => messageFail.classList.remove('alert-fail'), 7000);
					}
				);
		} else {
			messageFail.classList.add('alert-fail');
			setTimeout(() => messageFail.classList.remove('alert-fail'), 7000);
		}
	};
</script>

<svelte:head>
	<title>Nathan Meeker || Contact</title>
</svelte:head>

<div in:fly={{ y: -100, duration: 500, delay: 400 }} out:fade>
	<SubPageTitleBar title={'Contact me'} colorVar={'white'} textColor={'var(--light-blue)'} />
	<div class="contact">
		<div id="contact-card" class="card-inner">
			<form action="#" id="contact-form" class="form" on:submit={messageSubmit}>
				<label for="first-name">first name: </label>
				<input
					id="first-name"
					type="text"
					size="50"
					placeholder="First Name"
					bind:value={fName}
					on:focus={(e) => clearInvalidation(e, 'First Name')}
					on:click={(e) => clearInvalidation(e, 'First Name')}
					on:blur={(e) => validateBlankField(e)}
				/>
				<label for="last-name">last name: </label>
				<input
					id="last-name"
					type="text"
					size="50"
					placeholder="Last Name"
					bind:value={lName}
					on:focus={(e) => clearInvalidation(e, 'Last Name')}
					on:click={(e) => clearInvalidation(e, 'Last Name')}
					on:blur={(e) => validateBlankField(e)}
				/>
				<label for="email"
					>email:
					<span bind:this={emailFormat} class="alert hidden"
						>entry is not a valid email address.</span
					></label
				>
				<input
					id="email"
					type="text"
					size="50"
					placeholder="Email"
					bind:value={email}
					on:focus={(e) => clearInvalidation(e, 'Email')}
					on:click={(e) => clearInvalidation(e, 'Email')}
					on:blur={(e) => validateBlankField(e)}
					on:keyup={() => keyEventValidator(validateEmail)}
				/>
				<label for="message">message: </label>
				<textarea
					id="message"
					cols="50"
					rows="5"
					placeholder="Enter message here."
					bind:value={message}
					on:focus={(e) => clearInvalidation(e, 'Enter message here.')}
					on:click={(e) => clearInvalidation(e, 'Enter message here.')}
					on:blur={(e) => validateBlankField(e)}
				/>
				<span id="message-success" class="alert hidden" bind:this={messageSuccess}
					>Thank you for reaching out to me! I will get back to you shortly.</span
				>
				<span id="message-fail" class="alert hidden" bind:this={messageFail}
					>Your message failed to send. Check the information and try again.</span
				>
				<button class="btn btn-main btn-contact" type="submit" value="submit">send message</button>
			</form>
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
		width: 100%;
		margin: auto;
	}

	input,
	textarea {
		padding: 20px;
		margin: 5px;
		font-size: 1.5em;
		border: none;
		border-radius: 0.2em;
		cursor: pointer;
	}

	label {
		font-size: 1.5em;
		color: white;
	}

	.contact {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 20vh auto;
		height: 90vh;
		width: 100%;
	}

	.card-inner {
		position: relative;
		padding: 80px;
		width: 30%;
		background: center
			linear-gradient(to bottom right, var(--shadow-color) 65%, var(--light-blue) 90%);
		border-radius: 1em;
		box-shadow: inset 0 0 20px var(--shadow-color), 0 0 80px var(--shadow-color);
	}

	:global(.alert-warn) {
		-webkit-animation: alertEnter 1s linear forwards;
		animation: alertEnter 1s linear forwards;
		display: inline-block;
		background-color: rgba(242, 242, 24, 0.8);
	}

	:global(.alert-success) {
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

	:global(.alert-fail) {
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

	.alert {
		font-size: 1.2vmax;
		padding: 5px;
		width: -webkit-fit-content;
		width: -moz-fit-content;
		width: fit-content;
		border-radius: 0.2em;
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

	@media only screen and (max-width: 1400px) {
		.card-inner {
			width: 40%;
			padding: 20px;
		}
	}

	@media only screen and (max-width: 800px) {
		.card-inner {
			width: 75%;
			padding: 25px;
		}
	}

	@media only screen and (max-width: 650px) {
		.card-inner {
			width: 90%;
			padding: 15px;
		}
	}
</style>
