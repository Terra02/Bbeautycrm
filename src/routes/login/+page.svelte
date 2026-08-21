<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>Вход - Beauty CRM</title>
</svelte:head>

<main class="login">
	<form method="POST">
		<p>Beauty CRM</p>
		<h1>Вход в систему</h1>
		{#if form?.error}
			<div class="error">{form.error}</div>
		{/if}
		<label>
			Email
			<input name="email" type="email" autocomplete="email" required />
		</label>
		<label>
			Пароль
			<input name="password" type="password" autocomplete="current-password" required />
		</label>
		<button>Войти</button>
	</form>
</main>

<style>
	:global(body) {
		margin: 0;
		font-family:
			Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		color: #26211f;
		background: #f6f3ee;
	}

	.login {
		display: grid;
		place-items: center;
		min-height: 100vh;
		padding: 20px;
	}

	form {
		display: grid;
		gap: 16px;
		width: min(100%, 420px);
		border: 1px solid #e3dbd1;
		border-radius: 8px;
		padding: 24px;
		background: #fff;
	}

	p {
		margin: 0;
		color: #8a4b38;
		font-weight: 800;
	}

	h1 {
		margin: 0;
		font-size: 2rem;
	}

	label {
		display: grid;
		gap: 6px;
		color: #686057;
		font-weight: 700;
	}

	input {
		box-sizing: border-box;
		width: 100%;
		border: 1px solid #ded6ce;
		border-radius: 8px;
		padding: 11px 12px;
		color: #26211f;
		font: inherit;
	}

	button {
		border: 0;
		border-radius: 8px;
		padding: 12px 16px;
		color: #fff;
		background: #26211f;
		font: inherit;
		font-weight: 800;
	}

	.error {
		border-radius: 8px;
		padding: 10px 12px;
		color: #8a1f17;
		background: #fff0ed;
		font-weight: 700;
	}
</style>

