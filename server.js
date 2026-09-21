require('dotenv').config();

const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 3000);
const dataDirectory = process.env.DATA_DIR || path.join(__dirname, 'data');
const dataFile = path.join(dataDirectory, 'data.json');
const defaultProfile = {
  sekolah: 'SDN 07 Sitapung', lokasi: 'Sitapung',
  namaKepala: 'Dra. ARNELIS', nipKepala: '19680526 198802 2 001',
  namaBendahara: 'RIKA FITRIANI, S.Pd.SD', nipBendahara: '19810129 200901 2002'
};
let data = { profile: { ...defaultProfile }, receipts: [] };
let saveQueue = Promise.resolve();

async function loadData() {
  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    const saved = JSON.parse(await fs.readFile(dataFile, 'utf8'));
    data = { profile: { ...defaultProfile, ...(saved.profile || {}) }, receipts: Array.isArray(saved.receipts) ? saved.receipts : [] };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await saveData();
  }
}
function saveData() {
  saveQueue = saveQueue.then(async () => {
    const temporaryFile = `${dataFile}.tmp`;
    await fs.writeFile(temporaryFile, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(temporaryFile, dataFile);
  });
  return saveQueue;
}
function cleanReceipt(body) {
  const text = value => String(value ?? '').trim();
  const items = Array.isArray(body.items) ? body.items.map(item => ({ nama: text(item.nama), vol: Math.max(0, Number(item.vol) || 0), satuanHarga: Math.max(0, Number(item.satuanHarga) || 0) })) : [];
  return { id: text(body.id), no: text(body.no), kodeAkun: text(body.kodeAkun), tanggalRaw: /^\d{4}-\d{2}-\d{2}$/.test(text(body.tanggalRaw)) ? text(body.tanggalRaw) : '', folio: text(body.folio), terimaDari: text(body.terimaDari), uraian: text(body.uraian), namaTerang: text(body.namaTerang), alamatTerang: text(body.alamatTerang), tampilkanDaftar: body.tampilkanDaftar !== false, items };
}

app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/profile', (_req, res) => res.json(data.profile));
app.put('/api/profile', async (req, res, next) => { try { data.profile = { ...defaultProfile, ...req.body }; await saveData(); res.json(data.profile); } catch (error) { next(error); } });
app.get('/api/receipts', (_req, res) => res.json([...data.receipts].sort((a, b) => String(b.tanggalRaw).localeCompare(String(a.tanggalRaw)))));
app.put('/api/receipts/:id', async (req, res, next) => { try {
  const receipt = cleanReceipt({ ...req.body, id: req.params.id });
  if (!receipt.id) return res.status(400).json({ error: 'ID kwitansi wajib diisi.' });
  const index = data.receipts.findIndex(item => item.id === receipt.id);
  if (index === -1) data.receipts.push(receipt); else data.receipts[index] = receipt;
  await saveData(); res.json(receipt);
} catch (error) { next(error); } });
app.delete('/api/receipts/:id', async (req, res, next) => { try {
  const index = data.receipts.findIndex(item => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Kwitansi tidak ditemukan.' });
  data.receipts.splice(index, 1); await saveData(); res.status(204).end();
} catch (error) { next(error); } });
app.use(express.static(path.join(__dirname)));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ error: 'Data tidak dapat disimpan.' }); });

function startServer() {
  return new Promise(async (resolve, reject) => {
    try {
      await loadData();
      const server = app.listen(port, '127.0.0.1', () => resolve(server));
      server.on('error', reject);
    } catch (error) { reject(error); }
  });
}
if (require.main === module) startServer().then(() => console.log(`Aplikasi siap di http://localhost:${port}`)).catch(error => { console.error('Aplikasi tidak dapat dimulai:', error.message); process.exit(1); });
module.exports = { startServer };
