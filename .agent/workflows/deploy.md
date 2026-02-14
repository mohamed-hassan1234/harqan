---
description: Deploy MERN stack application to VPS (Nginx, PM2, MongoDB)
---

# MERN Stack Deployment Workflow (Harqaan)

Follow these steps to deploy the application on your VPS.

## 1. Initial Server Setup

// turbo

1. Create a deployment user:

   ```bash
   adduser harqaan_user
   usermod -aG sudo harqaan_user
   ```
nadiifo89@120!
2. Login to the server:

   ```bash
   ssh harqaan_user@YOUR_SERVER_IP
   ```

3. Update and Install Essentials:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install curl git nginx mongodb-server -y
   ```

## 2. Install Node.js & Tooling

// turbo

1. Install Node.js 20:

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install nodejs -y
   ```

2. Install PM2:
   ```bash
   sudo npm install -g pm2
   pm2 startup
   ```

## 3. Clone and Setup Project

1. Navigate to `/var/www` and clone:

   ```bash
   sudo mkdir -p /var/www/harqaan
   sudo chown -R $USER:$USER /var/www/harqaan
   cd /var/www/harqaan
   git clone https://github.com/YOUR_USERNAME/harqaan.git .
   ```

2. Setup Backend:

   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your production values (JWT_SECRET, MONGO_URI, etc.)
   # Make sure PORT=5000
   nano .env
   ```

3. Setup Frontend:
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   # Ensure VITE_API_URL=https://sample.nidwa.com/api
   npm run build
   ```

## 4. Database Setup (MongoDB with Auth)

To manage MongoDB like a pro (with users and multiple databases):

1. Enter MongoDB shell:

   ```bash
   mongosh
   ```

2. Create Admin User:

   ```javascript
   use admin
   db.createUser({
     user: "adminUser",
     pwd: "YourStrongPassword",
     roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
   })
   ```

3. Enable Authentication in `/etc/mongodb.conf`:

   ```bash
   sudo nano /etc/mongodb.conf
   # Find #auth = true and change to:
   auth = true
   ```

4. Restart MongoDB:
   ```bash
   sudo systemctl restart mongodb
   ```

## 5. Configure Nginx

1. Create config file:

   ```bash
   sudo nano /etc/nginx/sites-available/harqaan
   ```

2. Paste configuration:

   ```nginx
   server {
       listen 80;
       server_name sample.nidwa.com www.sample.nidwa.com;

       root /var/www/harqaan/client/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api/ {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Enable site and restart:
   ```bash
   sudo ln -s /etc/nginx/sites-available/harqaan /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 6. Start Application

1. Start Backend with PM2:
   ```bash
   cd /var/www/harqaan/server
   pm2 start src/server.js --name "harqaan-api"
   pm2 save
   ```

## 7. SSL with Certbot

1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d sample.nidwa.com -d www.sample.nidwa.com
   ```
