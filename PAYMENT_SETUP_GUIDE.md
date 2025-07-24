# Payment Integration Setup Guide

This guide will help you set up PayPal and Stripe payment processing for your Rust store.

## 🚀 Quick Setup Overview

1. **PayPal Business Account Setup**
2. **Stripe Account Setup**
3. **Environment Variables Configuration**
4. **Webhook Configuration**
5. **Testing & Deployment**

## 📋 Prerequisites

- PayPal Business Account
- Stripe Account
- Netlify Account (for hosting)
- Discord Server (for notifications)

---

## 🔧 Step 1: PayPal Business Setup

### 1.1 Create PayPal Business Account
1. Go to [PayPal Business](https://www.paypal.com/business)
2. Click "Sign Up" and create a business account
3. Complete business verification process

### 1.2 Get PayPal Developer Credentials
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in with your business account
3. Navigate to "Apps & Credentials"
4. Click "Create App"
5. Name it "Rust Store"
6. Select "Business" account type
7. Copy the **Client ID** and **Client Secret**

### 1.3 Create PayPal Webhook
1. In PayPal Developer Dashboard, go to "Webhooks"
2. Click "Add Webhook"
3. URL: `https://your-domain.com/.netlify/functions/paypal-webhook`
4. Events to listen for:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
5. Copy the **Webhook ID** and **Webhook Secret**

---

## 💳 Step 2: Stripe Setup

### 2.1 Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a free account
3. Complete account verification

### 2.2 Get Stripe API Keys
1. In Stripe Dashboard, go to "Developers" → "API Keys"
2. Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy the **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 2.3 Create Stripe Webhook
1. In Stripe Dashboard, go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. URL: `https://your-domain.com/.netlify/functions/stripe-webhook`
4. Events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Webhook Secret** (starts with `whsec_`)

---

## ⚙️ Step 3: Environment Variables

### 3.1 Netlify Environment Variables
1. Go to your Netlify dashboard
2. Navigate to your site settings
3. Go to "Environment variables"
4. Add the following variables:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_SECRET=your_paypal_webhook_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id

# Discord Configuration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_discord_server_id
DISCORD_CHANNEL_ID=your_discord_channel_id

# RCON Configuration
RCON_HOST=your_rust_server_ip
RCON_PORT=28016
RCON_PASSWORD=your_rcon_password

# Server Configuration
SERVER_NAME=Your Rust Server Name
SERVER_DOMAIN=your-domain.com
```

### 3.2 Update Configuration Files
1. Update `payment-config.js` with your actual keys
2. Replace placeholder values with real credentials

---

## 🔗 Step 4: Discord Integration

### 4.1 Create Discord Webhook
1. Go to your Discord server
2. Navigate to a channel
3. Edit channel → Integrations → Webhooks
4. Create webhook
5. Copy the webhook URL

### 4.2 Create Discord Bot (Optional)
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to "Bot" section
4. Create bot and copy token
5. Invite bot to your server

---

## 🧪 Step 5: Testing

### 5.1 Test PayPal Integration
1. Use PayPal sandbox for testing
2. Create test payments
3. Verify webhook receives events
4. Check Discord notifications

### 5.2 Test Stripe Integration
1. Use Stripe test mode
2. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. Verify payment processing
4. Check webhook events

### 5.3 Test Complete Flow
1. Add items to cart
2. Proceed to checkout
3. Complete payment
4. Verify Discord notification
5. Check RCON command execution

---

## 🚀 Step 6: Production Deployment

### 6.1 Switch to Live Keys
1. Update PayPal to live environment
2. Update Stripe to live mode
3. Update webhook URLs to production domain
4. Test with small amounts first

### 6.2 Security Checklist
- [ ] All API keys are secure
- [ ] Webhook signatures are verified
- [ ] HTTPS is enabled
- [ ] Environment variables are set
- [ ] Error handling is implemented
- [ ] Logging is configured

---

## 📊 Step 7: Monitoring

### 7.1 Payment Monitoring
- Monitor PayPal dashboard for transactions
- Monitor Stripe dashboard for payments
- Set up alerts for failed payments
- Track webhook delivery status

### 7.2 Discord Notifications
- Payment completed notifications
- Payment failed alerts
- Refund notifications
- System status updates

---

## 🛠️ Troubleshooting

### Common Issues

#### PayPal Issues
- **Webhook not received**: Check URL and events
- **Payment not captured**: Verify client credentials
- **Signature verification failed**: Check webhook secret

#### Stripe Issues
- **Payment intent creation failed**: Check secret key
- **Webhook signature invalid**: Verify webhook secret
- **Card declined**: Use test cards for testing

#### General Issues
- **Environment variables not loading**: Check Netlify settings
- **Discord notifications not sending**: Verify webhook URL
- **RCON commands not executing**: Check server connection

### Debug Steps
1. Check browser console for errors
2. Check Netlify function logs
3. Verify webhook delivery
4. Test API endpoints manually
5. Check environment variables

---

## 📞 Support

- **PayPal Business Support**: For payment issues
- **Stripe Support**: For payment processing issues
- **Netlify Support**: For hosting and deployment issues
- **Discord Developer Support**: For bot and webhook issues

---

## 🎯 Next Steps

After completing this setup:

1. **Test thoroughly** with small amounts
2. **Monitor** payment processing
3. **Set up** automated delivery system
4. **Configure** RCON commands for your server
5. **Implement** additional security measures
6. **Scale** as your business grows

---

**🎉 Congratulations!** Your Rust store now has full payment processing capabilities with PayPal and Stripe integration! 