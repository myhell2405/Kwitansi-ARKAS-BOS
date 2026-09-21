const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
let server;

async function createWindow() {
  // Data berada di folder pengguna, bukan folder instalasi, sehingga aman saat aplikasi diperbarui.
  process.env.DATA_DIR = path.join(app.getPath('userData'), 'data');
  // Port acak mencegah benturan apabila komputer sudah memakai port 3000.
  process.env.PORT = '0';
  try { server = await require('./server').startServer(); }
  catch (error) { dialog.showErrorBox('Aplikasi tidak dapat dibuka', error.message); app.quit(); return; }
  const window = new BrowserWindow({ width: 1280, height: 860, minWidth: 900, minHeight: 650, title: 'Kwitansi ARKAS BOS', webPreferences: { nodeIntegration: false, contextIsolation: true } });
  await window.loadURL(`http://127.0.0.1:${server.address().port}`);
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
app.on('before-quit', () => { if (server) server.close(); });
