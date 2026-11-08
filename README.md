# Next.js Full-Stack SQLite App

Aplikasi web full-stack menggunakan Next.js (App Router, TypeScript, Tailwind CSS), Prisma ORM dengan SQLite, siap di-deploy ke server Debian 13 (RAM 1.8GB) melalui GitHub Actions.

Aplikasi dikonfigurasi untuk berjalan di sub-path `/app/` (`basePath: '/app'`) dengan mode build `standalone` pada port `3001` di bawah user `filebrowser`.

---

## 🛠️ Konfigurasi Server Produksi (Debian 13)

- **Target OS**: Debian 13 (RAM 1.8GB)
- **User Aplikasi**: `filebrowser`
- **User SSH**: `kenzo`
- **IP Server (Tailscale)**: `100.99.99.2`
- **Port Internal**: `3001`
- **Target Folder**: `/var/www/testing-next`
- **Database Path**: `file:./prisma/prod.db`
- **Nginx Location**: `/app/`

---

## ⚙️ 1. Setup Awal di Server Debian 13

Jalankan perintah-perintah berikut di server Debian 13 (login melalui SSH sebagai user `kenzo`):

### A. Buat Folder Deploy & Atur Izin Kepemilikan
```bash
sudo mkdir -p /var/www/testing-next/prisma
sudo chown -R filebrowser:filebrowser /var/www/testing-next
# Izinkan user kenzo menulis ke folder ini untuk deployment SCP
sudo usermod -aG filebrowser kenzo
sudo chmod -R 775 /var/www/testing-next
```

### B. Izinkan User `kenzo` Menjalankan Sudoers Tanpa Password
Agar GitHub Actions dapat menjalankan `sudo chown` dan `sudo systemctl` tanpa interupsi password:
```bash
echo "kenzo ALL=(ALL) NOPASSWD: /usr/bin/systemctl, /usr/bin/chown" | sudo tee /etc/sudoers.d/next-app-deploy
sudo chmod 0440 /etc/sudoers.d/next-app-deploy
```

### C. Pasang File Service Systemd
Buat file `/etc/systemd/system/next-app.service`:
```ini
[Unit]
Description=Next.js Standalone App Service
After=network.target

[Service]
Type=simple
User=filebrowser
Group=filebrowser
WorkingDirectory=/var/www/testing-next
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=HOSTNAME=127.0.0.1
Environment=DATABASE_URL="file:./prisma/prod.db"
ExecStart=/usr/bin/node /var/www/testing-next/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Aktifkan service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable next-app
```

### D. Konfigurasi Reverse Proxy Nginx (Port 3001 & `/app/`)
Tambahkan blok konfigurasi ini ke dalam blok `server` Nginx Anda:

```nginx
# Redirect jika pengunjung membuka /app tanpa slash di akhir
location = /app {
    return 301 /app/;
}

# Proxy ke port 3001 (Wajib menggunakan trailing slash)
location /app/ {
    proxy_pass http://127.0.0.1:3001/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Uji dan reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 2. GitHub Secrets

Di repositori GitHub Anda (**Settings > Secrets and variables > Actions**), tambahkan:

1. `SERVER_IP` : `100.99.99.2`
2. `SERVER_USER` : `kenzo`
3. `SSH_PRIVATE_KEY` : Kunci SSH privat untuk user `kenzo`.
4. `TAILSCALE_AUTHKEY` : Kunci autentikasi Tailscale (Wajib agar GitHub Actions runner dapat menjangkau IP `100.99.99.2`).
