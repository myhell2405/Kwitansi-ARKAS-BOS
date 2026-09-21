# Kwitansi ARKAS BOS

Aplikasi desktop untuk membuat, menyimpan, dan mencetak kwitansi ARKAS BOS. Data tersimpan secara lokal pada komputer pengguna; aplikasi tidak memerlukan MySQL atau koneksi internet untuk digunakan.

## Versi aplikasi desktop untuk guru (Windows)

Bangun installer Windows dengan:

```bash
npm install
npm run dist:win
```

Kirimkan berkas Setup yang dihasilkan di folder `dist/` kepada guru. Saat instalasi, biarkan pilihan **Create a desktop shortcut** aktif. Setelah itu aplikasi dibuka dengan klik dua kali ikon **Kwitansi ARKAS BOS** di desktop—tanpa memasang Node.js, MySQL, atau membuka browser.

Data tiap guru disimpan lokal di komputernya dan tidak hilang saat aplikasi diperbarui. Untuk cadangan atau pindah komputer, salin berkas berikut saat aplikasi tertutup:

```text
%APPDATA%\arkas-bos-kwitansi\data\data.json
```

### Paket portabel (tanpa instalasi)

Jika installer belum dapat dipakai, kirim paket ZIP portabel yang disimpan terpisah dari repositori. Guru mengekstraknya, misalnya ke `C:\Kwitansi ARKAS BOS`, lalu membuka folder `win-unpacked` dan klik kanan `Kwitansi ARKAS BOS.exe` → **Show more options** → **Send to** → **Desktop (create shortcut)**. Setelah itu aplikasi dapat dibuka dari ikon desktop.

## Menjalankan dari proyek (untuk pengembang)

```bash
npm install
npm run desktop
```

Untuk menjalankan versi web lokal, pakai `npm start`, lalu buka `http://localhost:3000`.

## Struktur proyek

- `index.html` — antarmuka aplikasi.
- `server.js` — API dan penyimpanan data lokal berbasis JSON.
- `main.js` — pembuka aplikasi desktop Electron.
- `.env.example` — contoh konfigurasi port untuk pengembangan.

Folder `data/`, `dist/`, `release/`, `node_modules/`, dan `.env` sengaja tidak diunggah ke GitHub.
