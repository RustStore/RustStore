// Payment Configuration
// Environment variables are used for sensitive keys

const PAYMENT_CONFIG = {
    // Stripe Configuration
    stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'your_stripe_publishable_key_here',
        secretKey: process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key_here', // Only used on server side
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'your_stripe_webhook_secret_here'
    },
    
    // PayPal Configuration
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID || 'your_paypal_client_id_here',
        clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'your_paypal_client_secret_here', // Only used on server side
        webhookSecret: process.env.PAYPAL_WEBHOOK_SECRET || 'your_paypal_webhook_secret_here',
        webhookId: process.env.PAYPAL_WEBHOOK_ID || 'your_paypal_webhook_id_here'
    },
    
    // Discord Configuration
    discord: {
        webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/your_webhook_url_here',
        botToken: process.env.DISCORD_BOT_TOKEN || 'your_discord_bot_token_here',
        guildId: process.env.DISCORD_GUILD_ID || 'your_discord_server_id_here',
        channelId: process.env.DISCORD_CHANNEL_ID || 'your_discord_channel_id_here'
    },
    
    // RCON Configuration
    rcon: {
        host: process.env.RCON_HOST || 'your_rust_server_ip_here',
        port: process.env.RCON_PORT || 28016, // Default RCON port
        password: process.env.RCON_PASSWORD || 'your_rcon_password_here'
    },
    
    // Server Configuration
    server: {
        name: process.env.SERVER_NAME || 'Your Rust Server Name',
        domain: process.env.SERVER_DOMAIN || 'your-domain.com'
    }
};

// Environment-specific configurations
const ENV_CONFIG = {
    development: {
        stripe: {
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_key_here',
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_webhook_secret_development'
        },
        paypal: {
            clientId: process.env.PAYPAL_CLIENT_ID || 'test_client_id_development',
            webhookSecret: process.env.PAYPAL_WEBHOOK_SECRET || 'test_webhook_secret_development'
        }
    },
    
    production: {
        stripe: {
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_your_live_key_here',
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_live_webhook_secret_here'
        },
        paypal: {
            clientId: process.env.PAYPAL_CLIENT_ID || 'your_live_paypal_client_id_here',
            webhookSecret: process.env.PAYPAL_WEBHOOK_SECRET || 'your_paypal_webhook_secret_here'
        }
    }
};

// Get current environment
const getCurrentEnv = () => {
    if (typeof window !== 'undefined') {
        // Client-side: check for environment variable or default to development
        return window.location.hostname === 'localhost' ? 'development' : 'production';
    } else {
        // Server-side: check Node.js environment
        return process.env.NODE_ENV || 'development';
    }
};

// Export configuration based on environment
const currentEnv = getCurrentEnv();
const config = {
    ...PAYMENT_CONFIG,
    ...ENV_CONFIG[currentEnv]
};

// For client-side use
if (typeof window !== 'undefined') {
    window.PAYMENT_CONFIG = {
        stripe: {
            publishableKey: config.stripe.publishableKey
        },
        paypal: {
            clientId: config.paypal.clientId
        }
    };
}

// For server-side use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} 