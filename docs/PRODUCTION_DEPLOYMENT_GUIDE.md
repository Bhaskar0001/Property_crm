# 🚀 Production Deployment Guide — Hostinger VPS

This guide provides step-by-step instructions for provisioning, configuring, and maintaining the **Real Estate Property OS** on an Ubuntu 22.04 LTS Hostinger VPS.

---

## 1. System Requirements & Architecture
- **OS**: Ubuntu 22.04 / 24.04 LTS 64-bit
- **RAM**: Minimum 2 GB (Recommended 4 GB+)
- **CPU**: 2+ Cores
- **Node.js**: v20.x Active LTS
- **Database**: MongoDB Atlas Cluster or Local MongoDB 7.0+
- **Cache/Queues**: Redis 7+
- **Process Manager**: PM2 (Cluster Mode)
- **Web Server**: Nginx (Reverse Proxy with SSL & HTTP/2)
- **Storage**: Cloudflare R2 Object Storage

---

## 2. Server Initial Provisioning

Connect to your Hostinger VPS via SSH:
```bash
ssh root@YOUR_SERVER_IP
```

Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx ufw
```

### Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v # Verify v20.x.x
npm -v  # Verify 10.x.x
```

### Install PM2 globally
```bash
sudo npm install -g pm2
pm2 startup systemd
```

### Configure UFW Firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

---

## 3. Clone Codebase & Install Dependencies

```bash
sudo mkdir -p /var/www/realestate
sudo chown -R $USER:$USER /var/www/realestate
git clone https://github.com/YOUR_ORG/RealEstate.git /var/www/realestate
cd /var/www/realestate

# Install dependencies across all npm workspaces
npm install --legacy-peer-deps
```

---

## 4. Environment Variables Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
nano .env
```

Ensure production values are configured:
```env
NODE_ENV=production
PORT=5000
API_URL=https://realestate-property.com/api/v1

MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/realestate?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379

JWT_SECRET=super_secure_random_64_character_string_here
JWT_REFRESH_SECRET=another_super_secure_random_64_character_string_here

# Cloudflare R2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=realestate-production
R2_PUBLIC_URL=https://media.realestate-property.com

# Resend Email
RESEND_API_KEY=re_your_api_key
MAIL_FROM=Advisory <enquiries@realestate-property.com>

# Meta WhatsApp Cloud API
WHATSAPP_TOKEN=EAAG...
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_BUSINESS_ACCOUNT_ID=9876543210
WHATSAPP_VERIFY_TOKEN=your_custom_webhook_secret_here

# Google Gemini AI
GEMINI_API_KEY=AIzaSy...
```

---

## 5. Build Monorepo Workspaces

Run production builds:
```bash
npm run build --workspace=@repo/shared
npm run build --workspace=@repo/api
npm run build --workspace=@repo/admin
npm run build --workspace=@repo/web
```

---

## 6. Configure Nginx & SSL

Copy the Nginx configuration:
```bash
sudo cp /var/www/realestate/nginx/realestate.conf /etc/nginx/sites-available/realestate.conf
sudo ln -s /etc/nginx/sites-available/realestate.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

Generate SSL certificates using Let's Encrypt:
```bash
sudo certbot --nginx -d realestate-property.com -d www.realestate-property.com -d admin.realestate-property.com
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Start Backend with PM2

```bash
cd /var/www/realestate
pm2 start ecosystem.config.js --env production
pm2 save
```

Verify PM2 status:
```bash
pm2 status
pm2 logs property-os-api --lines 20
```

---

## 8. Automated Database Backups Setup

Set up nightly cron job for MongoDB backups:
```bash
chmod +x /var/www/realestate/scripts/backup-db.sh
crontab -e
```

Add the following line to run every night at 2:00 AM:
```cron
0 2 * * * /var/www/realestate/scripts/backup-db.sh >> /var/log/cron-backup.log 2>&1
```

---

## 9. Zero-Downtime Deployments

To deploy any future updates to master, simply run:
```bash
bash /var/www/realestate/scripts/deploy-vps.sh
```
Or push to GitHub `master` branch to trigger the automated CI/CD pipeline!
