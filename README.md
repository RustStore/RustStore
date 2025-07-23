# 🎮 Rust Store - Automated Payment System

A professional Rust game store with automated payment processing, Discord notifications, and kit delivery via RCON commands.

## ✨ Features

- **Dual Payment Processing**: Stripe and PayPal integration
- **Automated Kit Delivery**: RCON commands via Nitrado API
- **Discord Notifications**: Real-time payment and delivery updates
- **Professional UI**: Black and gold theme with modern design
- **Serverless Functions**: Netlify functions for secure payment processing

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Payment**: Stripe, PayPal
- **Server**: Netlify Functions
- **Game Integration**: Nitrado API (RCON)
- **Notifications**: Discord Webhooks

## 🚀 Quick Start

1. Clone this repository
2. Set up environment variables in Netlify
3. Configure Stripe and PayPal webhooks
4. Deploy to Netlify

## 📁 Project Structure

```
├── index.html              # Main store page
├── checkout.html           # Payment checkout
├── script.js              # Frontend logic
├── config.js              # Configuration (no secrets)
├── netlify/
│   └── functions/         # Serverless functions
│       ├── stripe-webhook.js
│       ├── create-payment-intent.js
│       └── webhook.js
└── netlify.toml           # Netlify configuration
```

## 🔒 Security

- All secret keys are stored as environment variables
- No sensitive data in the repository
- Secure webhook verification

## 📝 License

MIT License - feel free to use and modify! 