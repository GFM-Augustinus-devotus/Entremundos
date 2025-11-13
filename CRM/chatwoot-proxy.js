
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

// Rota: mensagens de uma conversa específica
app.get('/api/chatwoot/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const url2 = `${BASE}/api/v1/accounts/${ACCOUNT}/conversations/${id}/messages`;

    console.log(`[chatwoot-proxy] Buscando mensagens da conversa ${id}:`, url2);

    const r = await fetch(url2, { headers: apiHeaders });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return res.status(r.status).json({ 
        error: 'Erro ao buscar mensagens da conversa', 
        status: r.status, 
        details: text, 
        url: url2 
      });
    }

    const data = await r.json();
    res.json(data); 
  } catch (err) {
    res.status(500).json({ 
      error: 'Erro interno ao buscar mensagens', 
      details: String(err) 
    });
  }
});

// Inicia o servidor (uma única vez)
app.listen(PORT, () => {
  console.log(`[chatwoot-proxy] Servidor rodando em http://localhost:${PORT}`);
});
