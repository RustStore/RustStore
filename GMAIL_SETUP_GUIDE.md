# Gmail Setup Guide for Purchase Tickets

This guide will help you set up Gmail to automatically send purchase confirmation emails to your customers.

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google," click on "2-Step Verification"
4. Follow the steps to enable 2-factor authentication

## Step 2: Generate an App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google," click on "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Enter a name like "Rust Store Email Service"
6. Click "Generate"
7. **Copy the 16-character password** (you'll need this for Netlify)

## Step 3: Add Environment Variables to Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site settings" → "Environment variables"
4. Add these variables:

### Required Variables:
- **GMAIL_USER**: Your Gmail address (e.g., `yourstore@gmail.com`)
- **GMAIL_APP_PASSWORD**: The 16-character app password you generated

### Example:
```
GMAIL_USER = yourstore@gmail.com
GMAIL_APP_PASSWORD = abcd efgh ijkl mnop
```

## Step 4: Test the Email Service

1. Deploy your site to Netlify
2. Make a test purchase
3. Check if the confirmation email is received

## Email Content

The purchase ticket email includes:
- ✅ Order details (item, price, payment method)
- ✅ Customer information (email, Discord, in-game username)
- ✅ Server information (name, date, time)
- ✅ Delivery status and instructions
- ✅ Thank you message
- ✅ Admin contact information

## Customization

You can customize the email content by editing the `netlify/functions/send-purchase-ticket.js` file:

### Update Server Information:
```javascript
serverName = "Your Rust Server Name",
serverDate = new Date().toLocaleDateString(),
serverTime = new Date().toLocaleTimeString()
```

### Update Admin Contact:
```javascript
<li>📧 Email: admin@yourserver.com</li>
<li>💬 Discord: Join our Discord server</li>
<li>🎫 Ticket System: Use our in-game ticket system</li>
```

## Troubleshooting

### Email Not Sending:
1. Check that GMAIL_USER and GMAIL_APP_PASSWORD are set correctly
2. Verify 2-factor authentication is enabled
3. Check Netlify function logs for errors
4. Ensure the Gmail account has "Less secure app access" enabled (if needed)

### Function Logs:
1. Go to Netlify dashboard → Functions
2. Click on "send-purchase-ticket"
3. Check the "Logs" tab for any errors

### Common Issues:
- **Authentication failed**: Check your app password
- **Rate limiting**: Gmail has daily sending limits
- **Spam filters**: Emails might go to spam initially

## Security Notes

- ✅ Use App Passwords, never your regular Gmail password
- ✅ Keep environment variables secure in Netlify
- ✅ The email function only accepts POST requests
- ✅ All customer data is validated before sending

## Email Preview

The email will look professional with:
- 🎮 Rust Store branding
- 📦 Clear order details
- 👤 Customer information
- 🖥️ Server details
- ✅ Delivery confirmation
- 🎉 Thank you message
- 🛠️ Support contact info

Your customers will receive a beautiful, professional confirmation email immediately after their purchase! 