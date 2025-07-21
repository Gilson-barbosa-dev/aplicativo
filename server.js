import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

dotenv.config(); // Carrega .env localmente

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GOOGLE_API_KEY;
const ROOT_FOLDER_ID = process.env.PASTA_ID;

const { Pool } = pg;
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Teste de conexão com banco (pode remover depois que confirmar que funciona)
pool.query('SELECT NOW()', (err, result) => {
  if (err) console.error('Erro ao conectar no PostgreSQL:', err);
  else console.log('Conectado ao PostgreSQL:', result.rows[0].now);
});

// Rota para salvar pedidos
app.post('/api/pedido', async (req, res) => {
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ error: 'Texto obrigatório' });

  try {
    await pool.query('INSERT INTO pedidos (texto) VALUES ($1)', [texto]);
    res.status(200).json({ sucesso: true });
  } catch (err) {
    console.error('Erro ao salvar pedido:', err);
    res.status(500).json({ error: 'Erro ao salvar no banco' });
  }
});

// Google Drive - Listar pastas
async function buscarSubpastas(pastaId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${pastaId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&fields=files(id,name)&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files || [];
}

// Google Drive - Listar músicas
async function buscarAudios(pastaId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${pastaId}'+in+parents+and+(mimeType contains 'audio')&fields=files(id,name)&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files || [];
}

// Rota raiz
app.get('/api/raiz', async (req, res) => {
  const subpastas = await buscarSubpastas(ROOT_FOLDER_ID);
  const resposta = subpastas.map(p => ({ id: p.id, nome: p.name, tipo: 'pasta' }));
  res.json(resposta);
});

// Rota para abrir pasta
app.get('/api/pasta/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pastas = await buscarSubpastas(id);
    const musicas = await buscarAudios(id);
    const resposta = [
      ...pastas.map(p => ({ id: p.id, nome: p.name, tipo: 'pasta' })),
      ...musicas.map(m => ({ nome: m.name, tipo: 'musica', link: `https://drive.google.com/uc?export=download&id=${m.id}` }))
    ];
    res.json(resposta);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao explorar pasta', message: err.message });
  }
});

// Rota do botão "Download Completo"
app.get('/api/download', (req, res) => {
  const url = `https://drive.google.com/drive/folders/${ROOT_FOLDER_ID}`;
  res.json({ url });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
