<script lang="ts">
	let { data, form } = $props();
</script>

<svelte:head>
	<title>Операторы - Beauty CRM</title>
</svelte:head>

<main class="operators">
	<header>
		<div>
			<p>Администрирование</p>
			<h1>Операторы</h1>
		</div>
		<nav>
			<a href="/dashboard">К дашборду</a>
			<a href="/admin/admins">Админы</a>
			<form method="POST" action="?/logout" class="logout-form">
				<button>Выход</button>
			</form>
		</nav>
	</header>

	<section class="workspace">
		<form method="POST" action="?/create">
			<h2>Создать оператора</h2>
			{#if form?.error}
				<div class="error">{form.error}</div>
			{/if}
			<label>
				Имя
				<input name="name" required />
			</label>
			<label>
				Email
				<input name="email" type="email" required />
			</label>
			<label>
				Пароль
				<input name="password" type="password" minlength="8" required />
			</label>
			<button>Создать аккаунт</button>
		</form>

		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Оператор</th>
						<th>Email</th>
						<th>Создан</th>
						<th>Записей</th>
					</tr>
				</thead>
				<tbody>
					{#each data.operators as operator}
						<tr>
							<td>{operator.name}</td>
							<td>{operator.email}</td>
							<td>{operator.createdAtFormatted}</td>
							<td>{operator.appointmentsCount}</td>
						</tr>
					{:else}
						<tr>
							<td colspan="4">Операторов пока нет</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		font-family:
			Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		color: #26211f;
		background: #f6f3ee;
	}

	.operators {
		display: grid;
		gap: 22px;
		padding: 28px clamp(16px, 4vw, 48px);
	}

	header {
		display: flex;
		justify-content: space-between;
		gap: 18px;
		align-items: center;
	}

	header p {
		margin: 0 0 8px;
		color: #8a4b38;
		font-weight: 800;
	}

	h1,
	h2 {
		margin: 0;
	}

	h1 {
		font-size: clamp(2rem, 5vw, 3.8rem);
		line-height: 1;
	}

	.workspace {
		display: grid;
		grid-template-columns: minmax(300px, 420px) minmax(0, 1fr);
		gap: 18px;
		align-items: start;
	}

	section form,
	.table-wrap {
		border: 1px solid #e3dbd1;
		border-radius: 8px;
		background: #fff;
	}

	section form {
		display: grid;
		gap: 14px;
		padding: 18px;
	}

	label {
		display: grid;
		gap: 6px;
		color: #686057;
		font-size: 0.9rem;
		font-weight: 700;
	}

	input {
		box-sizing: border-box;
		width: 100%;
		border: 1px solid #ded6ce;
		border-radius: 8px;
		padding: 10px 12px;
		color: #26211f;
		background: #fff;
		font: inherit;
	}

	button,
	header a {
		border: 0;
		border-radius: 8px;
		padding: 12px 16px;
		color: #fff;
		background: #26211f;
		font: inherit;
		font-weight: 800;
		text-decoration: none;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.logout-form {
		margin: 0;
	}

	.table-wrap {
		overflow: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		min-width: 640px;
	}

	th,
	td {
		border-bottom: 1px solid #eee7df;
		padding: 14px;
		text-align: left;
		white-space: nowrap;
	}

	th {
		color: #756a62;
		font-size: 0.82rem;
		text-transform: uppercase;
	}

	.error {
		border-radius: 8px;
		padding: 10px 12px;
		color: #8a1f17;
		background: #fff0ed;
		font-weight: 700;
	}

	@media (max-width: 900px) {
		header,
		.workspace {
			grid-template-columns: 1fr;
		}

		header {
			align-items: stretch;
		}
	}
</style>
