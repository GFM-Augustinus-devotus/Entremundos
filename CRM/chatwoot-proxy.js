
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const BASE = (process.env.CHATWOOT_BASE_URL || 'https://app.chatwoot.com').replace(/\/$/, '');
const ACCOUNT = process.env.CHATWOOT_ACCOUNT_ID || '1';
const TOKEN = process.env.CHATWOOT_TOKEN || '';

if (!TOKEN) {
  console.error('[chatwoot-proxy] Aviso: CHATWOOT_TOKEN não definido ou vazio. Algumas rotas podem falhar.');
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const apiHeaders = {
  'api_access_token': TOKEN,
  'Accept': 'application/json'
};

// Rota: contatos
app.get('/api/chatwoot/contacts', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const url = `${BASE}/api/v1/accounts/${ACCOUNT}/contacts?page=${page}`;
    const r = await fetch(url, { headers: apiHeaders });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return res.status(r.status).json({ error: 'Erro ao buscar contatos do Chatwoot', details: text });
    }
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao buscar contatos', details: String(err) });
  }
});

// Rota: conversas (note o plural — corresponde ao cliente)
app.get('/api/chatwoot/conversations', async (req, res) => {
  try {
    // parâmetros aceitos: status, assignee_type, inbox_id, page
    const { status, assignee_type, inbox_id, page } = req.query;
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (assignee_type) params.set('assignee_type', assignee_type);
    if (inbox_id) params.set('inbox_id', inbox_id);
    if (page) params.set('page', page);

    const qs = params.toString();
    const url = `${BASE}/api/v1/accounts/${ACCOUNT}/conversations${qs ? `?${qs}` : ''}`;

    const r = await fetch(url, { headers: apiHeaders });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return res.status(r.status).json({ error: 'Erro ao buscar conversas no Chatwoot', status: r.status, details: text, url });
    }
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao buscar conversas', details: String(err) });
  }
});

// Rota: inboxes
app.get('/api/chatwoot/inboxes', async (req, res) => {
  try {
    const url = `${BASE}/api/v1/accounts/${ACCOUNT}/inboxes`;
    const r = await fetch(url, { headers: apiHeaders });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return res.status(r.status).json({ error: 'Erro ao buscar inboxes', details: text });
    }
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao buscar inboxes', details: String(err) });
  }
});

// Inicia o servidor (uma única vez)
app.listen(PORT, () => {
  console.log(`[chatwoot-proxy] Servidor rodando em http://localhost:${PORT}`);
});
