<script lang="ts">
	let { data, form } = $props();

	let isAdmin = $derived(data.role === 'admin');
	let defaultDateTime = $derived(new Date().toISOString().slice(0, 16));
</script>

<svelte:head>
	<title>Панель - Beauty CRM</title>
</svelte:head>

<main class="dashboard">
	<header>
		<div>
			<p>{isAdmin ? 'Режим администратора' : 'Режим оператора'}</p>
			<h1>{isAdmin ? 'Все записи салона' : 'Мои внесенные записи'}</h1>
		</div>
		<nav>
			{#if isAdmin}
				<a href="/admin/admins">Админы</a>
				<a href="/admin/operators">Операторы</a>
			{/if}
			<form method="POST" action="?/logout" class="logout-form">
				<button>Выход</button>
			</form>
		</nav>
	</header>

	<section class="metrics">
		<article>
			<span>Записей сегодня</span>
			<strong>{data.metrics.today}</strong>
		</article>
		<article>
			<span>Новые</span>
			<strong>{data.metrics.new}</strong>
		</article>
		<article>
			<span>{isAdmin ? 'Операторов' : 'Мой статус'}</span>
			<strong>{isAdmin ? data.metrics.operators : 'Активен'}</strong>
		</article>
	</section>

	<section class="workspace">
		<form class="entry" method="POST" action="?/create">
			<h2>Данные из уведомления</h2>
			{#if form?.error}
				<div class="error">{form.error}</div>
			{/if}
			<div class="grid">
				<label>
					Клиент
					<input name="clientName" required />
				</label>
				<label>
					Телефон
					<input name="clientPhone" />
				</label>
				<label>
					Услуга
					<input name="serviceName" list="service-suggestions" required />
				</label>
				<label>
					Время
					<input name="appointmentTime" type="datetime-local" value={defaultDateTime} required />
				</label>
				<label>
					Место
					<input name="locationName" required />
				</label>
				<label>
					Заметка
					<input name="notes" />
				</label>
			</div>
			<datalist id="service-suggestions">
				<option value="Маникюр с покрытием"></option>
				<option value="Стрижка"></option>
				<option value="Окрашивание волос"></option>
				<option value="Коррекция бровей"></option>
				<option value="Макияж"></option>
				<option value="Уход за лицом"></option>
				<option value="Педикюр"></option>
				<option value="Ламинирование ресниц"></option>
				<option value="Наращивание ресниц"></option>
				<option value="Депиляция"></option>
				<option value="Эпиляция"></option>
				<option value="Татуаж бровей"></option>
				<option value="Укладка волос"></option>
				<option value="Химическая завивка"></option>
				<option value="Ламинирование волос"></option>
				<option value="Маски для лица и волос"></option>
				<option value="Массаж головы и шеи"></option>
			</datalist>
			<button>Сохранить</button>
		</form>

		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Клиент</th>
						<th>Время</th>
						<th>Услуга</th>
						<th>Место</th>
						{#if isAdmin}<th>Оператор</th>{/if}
						<th>Статус</th>
					</tr>
				</thead>
				<tbody>
					{#each data.appointments as appointment}
						<tr>
							<td>{appointment.clientName}</td>
							<td>{appointment.time}</td>
							<td>{appointment.service}</td>
							<td>{appointment.location}</td>
							{#if isAdmin}<td>{appointment.operator}</td>{/if}
							<td><span>{appointment.statusLabel}</span></td>
						</tr>
					{:else}
						<tr>
							<td colspan={isAdmin ? 6 : 5}>Пока нет записей</td>
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

	.dashboard {
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

	button,
	nav a {
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

	.metrics {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
	}

	.metrics article,
	.entry,
	.table-wrap {
		border: 1px solid #e3dbd1;
		border-radius: 8px;
		background: #fff;
	}

	.metrics article {
		display: grid;
		gap: 8px;
		padding: 18px;
	}

	.metrics span,
	label {
		color: #686057;
		font-size: 0.9rem;
		font-weight: 700;
	}

	.metrics strong {
		font-size: 2rem;
	}

	.workspace {
		display: grid;
		grid-template-columns: minmax(300px, 420px) minmax(0, 1fr);
		gap: 18px;
		align-items: start;
	}

	.entry {
		display: grid;
		gap: 14px;
		padding: 18px;
	}

	label {
		display: grid;
		gap: 6px;
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

	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.table-wrap {
		overflow: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		min-width: 760px;
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

	td span {
		border-radius: 999px;
		padding: 6px 10px;
		background: #edf7f0;
		color: #27613d;
		font-weight: 800;
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

		.metrics,
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
