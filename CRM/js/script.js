// Script básico para o CRM: navegação, formulários, arrastar e soltar, chat e calendário
document.addEventListener('DOMContentLoaded',()=>{
	// elements
	const menuItems = document.querySelectorAll('.menu-item');
	const views = document.querySelectorAll('.view');
	const pageTitle = document.getElementById('page-title');

	function showView(id){
		views.forEach(v=>{
			const hide = v.id!==id;
			v.setAttribute('aria-hidden', hide ? 'true':'false');
		});
		pageTitle.textContent = id.charAt(0).toUpperCase()+id.slice(1);
		document.querySelectorAll('.menu-item').forEach(mi=>mi.classList.toggle('active', mi.dataset.target===id));
	}

	menuItems.forEach(it=>{
		it.addEventListener('click',()=> showView(it.dataset.target));
	});

	// Palette quick apply
	document.querySelectorAll('.palette .color').forEach(c=>{
		c.addEventListener('click',()=>{
			const color = c.dataset.color;
			document.documentElement.style.setProperty('--primary', color);
		});
	});

	// Leads: adicionar e criar cartões arrastáveis
	const leadForm = document.getElementById('lead-form');
	const leadsList = document.getElementById('leads-list');

	function makeLeadCard(name,email){
		const el = document.createElement('div');
		el.className = 'lead-card';
		el.draggable = true;
		el.innerHTML = `<h4 contenteditable="true">${escapeHtml(name)}</h4><p contenteditable="true">${escapeHtml(email||'')}</p><div class="lead-actions"><button class="btn edit">Editar</button><button class="btn remove">Remover</button></div>`;
		// events
		el.querySelector('.remove').addEventListener('click',()=> el.remove());
		el.addEventListener('dragstart',e=>{
			e.dataTransfer.setData('text/plain','lead');
			e.dataTransfer.effectAllowed='move';
			el.classList.add('dragging');
		});
		el.addEventListener('dragend',()=> el.classList.remove('dragging'));
		return el;
	}

	leadForm.addEventListener('submit',e=>{
		e.preventDefault();
		const name = document.getElementById('lead-name').value.trim();
		const email = document.getElementById('lead-email').value.trim();
		if(!name) return;
		const card = makeLeadCard(name,email);
		leadsList.prepend(card);
		leadForm.reset();
	});

	// Drag & drop between dashboard widgets and leads area
	const dropZones = document.querySelectorAll('.cards, .list, #leads-list, #dashboard-widgets');
	dropZones.forEach(zone=>{
		zone.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move'; zone.classList.add('drag-over')});
		zone.addEventListener('dragleave',()=> zone.classList.remove('drag-over'));
		zone.addEventListener('drop',e=>{
			e.preventDefault(); zone.classList.remove('drag-over');
			const dragging = document.querySelector('.dragging');
			if(dragging) zone.appendChild(dragging);
		});
	});

	// Chats: simples envio de mensagens
	const chatSend = document.getElementById('chat-send');
	const chatInput = document.getElementById('chat-input');
	const chatMessages = document.getElementById('chat-messages');

	chatSend.addEventListener('click',sendChat);
	chatInput.addEventListener('keydown',e=>{ if(e.key==='Enter') sendChat(); });

	function sendChat(){
		const text = chatInput.value.trim();
		if(!text) return;
		const msg = document.createElement('div');
		msg.className='msg user';
		msg.textContent = text;
		chatMessages.appendChild(msg);
		chatInput.value='';
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}

	// Calendário: adicionar eventos simples
	const eventForm = document.getElementById('event-form');
	const eventsList = document.getElementById('events-list');
	eventForm.addEventListener('submit',e=>{
		e.preventDefault();
		const date = document.getElementById('event-date').value;
		const title = document.getElementById('event-title').value.trim();
		if(!date||!title) return;
		const li = document.createElement('li');
		li.textContent = `${date} — ${title}`;
		eventsList.prepend(li);
		eventForm.reset();
	});

	// Configurações: salvar perfil simples
	document.getElementById('save-profile').addEventListener('click',()=>{
		const name = document.getElementById('profile-name').value;
		const email = document.getElementById('profile-email').value;
		alert(`Perfil salvo:\n${name||'(sem nome)'}\n${email||'(sem email)'}`);
	});

	// small helpers
	function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({
		'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

	// inicial view
	showView('painel');
});

// Nota: script simples - projetado para demonstração e uso local. Pode ser estendido com persistência e integração a backend.
