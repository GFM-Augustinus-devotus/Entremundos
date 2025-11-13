
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

	// Chatwoot Leads
	const loadLeadsBtn = document.getElementById('load-chatwoot-leads');
	const leadsList = document.getElementById('chatwoot-leads-list');
	if (loadLeadsBtn && leadsList) {
		loadLeadsBtn.addEventListener('click', async () => {

			leadsList.innerHTML = '';
			try {
				const resposta = await fetch('http://localhost:3001/api/chatwoot/contacts');
				if (!resposta.ok) throw new Error('Erro ao buscar contatos');
				const dadosEntrada = await resposta.json();
				
				if (Array.isArray(dadosEntrada.payload)) {
					dadosEntrada.payload.forEach(contato => {
						const lista = document.createElement('li');
						lista.textContent = contato.name || contato.email || 'Contato sem nome';
						leadsList.appendChild(lista);
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

	// Chatwoot Chats
	const loadChatsBtn = document.getElementById('load-chatwoot-chats');
	const chatsInboxes = document.getElementById('chatwoot-chats-list');

	if (loadChatsBtn && chatsInboxes) {
	loadChatsBtn.addEventListener('click', async () => {
		chatsInboxes.innerHTML = '';
		try {
		const url = 'http://localhost:3001/api/chatwoot/conversations?status=all&assignee_type=all&page=1';
		const response = await fetch(url);
		console.log('GET /conversations ->', response.status);
		if (!response.ok) {
			const err = await response.json().catch(() => ({}));
			throw new Error(`(${response.status}) ${err.error || 'Falha'} ${err.details || ''}`);
		}

		const json = await response.json();
		const list = Array.isArray(json?.data)
			? json.data
			: (Array.isArray(json?.payload) ? json.payload : []);

		if (!list.length) {
			chatsInboxes.innerHTML = '<li>Nenhuma conversa encontrada</li>';
			return;
		}

		// renderiza cada conversa
		list.forEach(conv => {
			const li = document.createElement('li');
			li.classList.add('chat-item');

			const contactName =
			conv?.meta?.sender?.name ||
			conv?.meta?.sender?.identifier ||
			conv?.contact_inbox?.contact?.name ||
			`Contato #${conv?.sender_id || conv?.contact_id || '-'}`;

			const status = conv?.status || conv?.state || '—';
			li.textContent = `${contactName} • conversa #${conv.id} • ${status}`;

			// quando clicar, carrega as mensagens
			li.addEventListener('click', async () => {
			await carregarMensagens(conv.id, li);
			});

			chatsInboxes.appendChild(li);
		});

		} catch (e) {
		console.error('Erro ao carregar conversas:', e);
		const li = document.createElement('li');
		li.textContent = 'Erro ao carregar as conversas com os usuários' + (e && e.message ? ': ' + e.message : '');
		chatsInboxes.appendChild(li);
		}
	});
	}

	// função auxiliar: busca e mostra as mensagens
	async function carregarMensagens(conversationId, liElement) {
	try {
		const resp = await fetch(`http://localhost:3001/api/chatwoot/conversations/${conversationId}/messages`);
		const data = await resp.json();
		console.log('Mensagens da conversa', conversationId, data);

		// limpa mensagens anteriores (se houver)
		const oldMsgs = liElement.querySelector('.messages');
		if (oldMsgs) oldMsgs.remove();

		const msgsContainer = document.createElement('ul');
		msgsContainer.classList.add('messages');

		const mensagens = data.payload || data.data || [];

		if (!mensagens.length) {
		const msgLi = document.createElement('li');
		msgLi.textContent = 'Nenhuma mensagem nesta conversa.';
		msgsContainer.appendChild(msgLi);
		} else {
		mensagens.forEach(m => {
			const msgLi = document.createElement('li');
			const from = m.sender?.name || (m.message_type === 1 ? 'Contato' : 'Agente');
			msgLi.textContent = `${from}: ${m.content}`;
			msgsContainer.appendChild(msgLi);
		});
		}

		liElement.appendChild(msgsContainer);

	} catch (err) {
		console.error('Erro ao buscar mensagens:', err);
		const errLi = document.createElement('li');
		errLi.textContent = 'Erro ao carregar mensagens.';
		liElement.appendChild(errLi);
	}
	}


});


