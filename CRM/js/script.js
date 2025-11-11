
document.addEventListener('DOMContentLoaded', () => {
	// ...existing code...

	// Chatwoot Leads
	const loadLeadsBtn = document.getElementById('load-chatwoot-leads');
	const leadsList = document.getElementById('chatwoot-leads-list');
	if (loadLeadsBtn && leadsList) {
		loadLeadsBtn.addEventListener('click', async () => {

			leadsList.innerHTML = '';
			try {
				const response = await fetch('http://localhost:3001/api/chatwoot/contacts');
				if (!response.ok) throw new Error('Erro ao buscar contatos');
				const data = await response.json();
				if (Array.isArray(data.payload)) {
					data.payload.forEach(contato => {
						const li = document.createElement('li');
						li.textContent = contato.name || contato.email || 'Contato sem nome';
						leadsList.appendChild(li);
					});
				} else {
					leadsList.innerHTML = '<li>Nenhum contato encontrado.</li>';
				}
			} catch (err) {
				leadsList.innerHTML = '<li>Erro ao carregar contatos.</li>';
			} finally {
				
			}
		});
	}
});


document.addEventListener('DOMContentLoaded', () => {
	
	const menuItems = document.querySelectorAll('.menu-item');
	const views = document.querySelectorAll('.view');
	const pageTitle = document.getElementById('page-title');

	function showView(id){
		views.forEach(v => v.setAttribute('aria-hidden', v.id !== id ? 'true' : 'false'));
		document.querySelectorAll('.menu-item').forEach(mi => mi.classList.toggle('active', mi.dataset.target === id));
		const menuLabelEl = document.querySelector(`.menu-item[data-target="${id}"]`);
		if(pageTitle){
			pageTitle.textContent = menuLabelEl ? menuLabelEl.textContent : (id.charAt(0).toUpperCase()+id.slice(1));
		}
	}

	menuItems.forEach(it => {
		it.addEventListener('click', () => showView(it.dataset.target));
		it.addEventListener('keydown', e => {
			const isEnter = e.key === 'Enter' || e.code === 'Enter';
			const isSpace = e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space';
			if(isEnter || isSpace){ e.preventDefault(); it.click(); }
		});
	});

	showView('painel');
});


