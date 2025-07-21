# 🚀 Deployment Guide - Free & Reliable Hosting

## 🏆 **Recommended: Render.com (100% Free & Reliable)**

### Why Render?
- ✅ **750 hours/month free** (31 days = 744 hours)
- ✅ **24/7 uptime** - Never goes to sleep
- ✅ **Automatic restarts** if server crashes
- ✅ **SSL included** - Secure HTTPS
- ✅ **Easy deployment** - Just connect GitHub
- ✅ **Custom domains** - Free subdomain included
- ✅ **100% free** - No credit system, no hidden costs

## 📋 **Step-by-Step Render Deployment**

### Step 1: Prepare Your Code

1. **Create a `Procfile`** (tells Railway how to run your app):
```bash
# Create Procfile in your project root
echo "web: node automated-server.js" > Procfile
```

2. **Update `package.json`** (add start script):
```json
{
  "scripts": {
    "start": "node automated-server.js",
    "dev": "nodemon automated-server.js"
  }
}
```

3. **Create `.env` file** (for environment variables):
```bash
# Create .env file
touch .env
```

4. **Add environment variables** to `.env`:
```env
WEBHOOK_SECRET=your_secure_webhook_secret
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_discord_server_id
DISCORD_CHANNEL_ID=your_channel_id
RCON_HOST=your_gportal_server_ip
RCON_PORT=28016
RCON_PASSWORD=your_rcon_password
PAYPAL_EMAIL=your_paypal_email@example.com
CASHAPP_TAG=$YourCashtag
PORT=3000
```

### Step 2: Create GitHub Repository

1. **Initialize Git** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - Automated Rust Store"
```

2. **Create GitHub repo**:
   - Go to [GitHub.com](https://github.com)
   - Click "New repository"
   - Name it "rust-store-automated"
   - Make it public
   - Don't initialize with README

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/rust-store-automated.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render

1. **Go to Render.com**:
   - Visit [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**:
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository

3. **Configure Service**:
   - **Name**: `rust-store-automated`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables**:
   - Go to "Environment" tab
   - Add all variables from your `.env` file:
     - `WEBHOOK_SECRET`
     - `DISCORD_BOT_TOKEN`
     - `DISCORD_GUILD_ID`
     - `DISCORD_CHANNEL_ID`
     - `RCON_HOST`
     - `RCON_PORT`
     - `RCON_PASSWORD`
     - `PAYPAL_EMAIL`
     - `CASHAPP_TAG`
     - `PORT`

5. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically install dependencies and start your server
   - Wait for "Deploy Successful"

### Step 4: Get Your URLs

1. **Webhook URL**:
   - Go to "Settings" tab
   - Copy your domain (e.g., `https://your-app.onrender.com`)
   - Your webhook URL: `https://your-app.onrender.com/webhook`

2. **Update your website**:
   - Update `automated-payment-system.js` with the new webhook URL
   - Update `automated-server.js` with the new domain



## 🔧 **Alternative: Heroku (Limited Free)**

### Step 1: Install Heroku CLI
```bash
# Windows (PowerShell)
winget install --id=Heroku.HerokuCLI

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Deploy to Heroku
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-rust-store-app

# Add environment variables
heroku config:set WEBHOOK_SECRET=your_secure_webhook_secret
heroku config:set DISCORD_BOT_TOKEN=your_discord_bot_token
heroku config:set DISCORD_GUILD_ID=your_discord_server_id
heroku config:set DISCORD_CHANNEL_ID=your_channel_id
heroku config:set RCON_HOST=your_gportal_server_ip
heroku config:set RCON_PORT=28016
heroku config:set RCON_PASSWORD=your_rcon_password
heroku config:set PAYPAL_EMAIL=your_paypal_email@example.com
heroku config:set CASHAPP_TAG=$YourCashtag

# Deploy
git push heroku main

# Open app
heroku open
```

## 🔧 **Alternative: Fly.io (Very Reliable)**

### Step 1: Install Fly CLI
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### Step 2: Deploy to Fly
```bash
# Login to Fly
fly auth login

# Create app
fly launch

# Add secrets
fly secrets set WEBHOOK_SECRET=your_secure_webhook_secret
fly secrets set DISCORD_BOT_TOKEN=your_discord_bot_token
fly secrets set DISCORD_GUILD_ID=your_discord_server_id
fly secrets set DISCORD_CHANNEL_ID=your_channel_id
fly secrets set RCON_HOST=your_gportal_server_ip
fly secrets set RCON_PORT=28016
fly secrets set RCON_PASSWORD=your_rcon_password
fly secrets set PAYPAL_EMAIL=your_paypal_email@example.com
fly secrets set CASHAPP_TAG=$YourCashtag

# Deploy
fly deploy
```

## 🛡️ **Security Best Practices**

### 1. **Environment Variables**
- ✅ Never commit secrets to GitHub
- ✅ Use strong, unique secrets
- ✅ Rotate secrets regularly

### 2. **Webhook Security**
- ✅ Use HTTPS only
- ✅ Verify webhook signatures
- ✅ Rate limiting (built into platforms)

### 3. **Server Security**
- ✅ Automatic SSL certificates
- ✅ DDoS protection (included)
- ✅ Regular security updates

## 📊 **Monitoring & Reliability**

### Railway/Render/Fly Features:
- ✅ **Automatic restarts** if server crashes
- ✅ **Health checks** - Monitors server status
- ✅ **Logs** - View server logs in real-time
- ✅ **Metrics** - CPU, memory usage
- ✅ **Alerts** - Get notified of issues

### Monitoring Commands:
```bash
# Render
# View logs in dashboard

# Heroku
heroku logs --tail

# Fly
fly logs
```

## 🔄 **Continuous Deployment**

### Automatic Updates:
1. **Push to GitHub** → **Automatic deployment**
2. **No downtime** during updates
3. **Rollback** if something goes wrong

### Update Process:
```bash
# Make changes to your code
git add .
git commit -m "Update payment system"
git push origin main

# Platform automatically deploys
```

## 💰 **Cost Comparison**

| Platform | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| **Render** | 750 hours/month | $7/month | Best overall |
| **Fly.io** | 3 VMs, 3GB | $1.94/month | Very reliable |
| **Heroku** | Sleeps after 30min | $7/month | Limited free |
| **Railway** | $5/month credit | $5-20/month | Good alternative |

## 🎯 **Recommendation**

**Use Render.com** because:
- ✅ **100% free** (no credit system)
- ✅ **24/7 uptime** (never sleeps)
- ✅ **Easiest deployment**
- ✅ **Best reliability**
- ✅ **Good security**

## 🚀 **Quick Start (Render)**

1. **Create GitHub repo** with your code
2. **Sign up for Render** with GitHub
3. **Connect repo** to Render
4. **Add environment variables**
5. **Deploy** - Done!

**Your server will be running 24/7, secure, and 100% free! 🎉**

## 🔧 **Troubleshooting**

### Common Issues:

**Deployment Fails:**
- Check `package.json` has correct start script
- Verify all environment variables are set
- Check logs for specific errors

**Server Not Responding:**
- Verify webhook URL is correct
- Check Discord bot token is valid
- Test RCON connection

**Payment Issues:**
- Verify PayPal email and Cash App tag
- Check webhook is receiving requests
- Test Discord bot is online

### Get Help:
- **Render**: Documentation and community
- **Heroku**: Extensive documentation
- **Fly**: Active Discord community 