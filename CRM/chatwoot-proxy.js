const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const CHATWOOT_BASE_URL = process.env.CHATWOOT_BASE_URL;
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;
const CHATWOOT_TOKEN = process.env.CHATWOOT_TOKEN;

// *** NOVO: servir arquivos estáticos da pasta /public
app.use(express.static('public'));

if (!CHATWOOT_ACCOUNT_ID || !CHATWOOT_TOKEN) {
  console.error('Defina CHATWOOT_ACCOUNT_ID e CHATWOOT_TOKEN nas variáveis de ambiente.');
  process.exit(1);
}

app.use(cors());

app.get('/api/chatwoot/contacts', async (req, res) => {
  try {
    const page = req.query.page || 1; // suporte a paginação básica
    const url = `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts?page=${page}`;
    const response = await fetch(url, { headers: { 'api_access_token': CHATWOOT_TOKEN } });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return res.status(response.status).json({ error: 'Erro ao buscar contatos do Chatwoot', details: text });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao buscar contatos', details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor proxy rodando em http://localhost:${PORT}`);
});
