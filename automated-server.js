// Automated Server for Rust Store
// Handles webhooks, Discord integration, and GPortal RCON

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const net = require('net');
const { Client, GatewayIntentBits } = require('discord.js');

class AutomatedServer {
    constructor() {
        this.app = express();
        this.webhookSecret = process.env.WEBHOOK_SECRET || 'your_webhook_secret';
        this.rconConfig = {
            host: process.env.RCON_HOST || 'your_gportal_server_ip',
            port: parseInt(process.env.RCON_PORT) || 28016,
            password: process.env.RCON_PASSWORD || 'your_rcon_password'
        };
        this.discordConfig = {
            token: process.env.DISCORD_BOT_TOKEN || 'your_discord_bot_token',
            guildId: process.env.DISCORD_GUILD_ID || 'your_discord_server_id',
            channelId: process.env.DISCORD_CHANNEL_ID || 'your_channel_id'
        };
        
        this.paymentDatabase = new Map();
        this.userDiscordMap = new Map();
        this.kitCommands = {
            'Wood Bundle': 'give wood 10000',
            'Stone Bundle': 'give stone 10000',
            'Metal Fragments Bundle': 'give metal.fragments 10000',
            'HQM Bundle': 'give metal.refined 1000',
            'Cloth Bundle': 'give cloth 10000',
            'Low Grade Fuel Bundle': 'give fuel 1000',
            'Scrap Bundle': 'give scrap 10000',
            'Beginners Raiding Kit': 'give satchel.charge 12; give ammo.explosive 256',
            'Rookies Rocket Kit': 'give rocket.launcher 1; give rocket.basic 9',
            'Rocket Mania Kit': 'give rocket.launcher 2; give rocket.basic 18; give rocket.hv 6',
            'Demolitioner Kit': 'give explosive.timed.deployed 6',
            'Base Breacher': 'give explosive.timed.deployed 10; give ammo.explosive 384',
            'Explosive Addicted': 'give rocket.launcher 3; give rocket.basic 27; give rocket.hv 9; give ammo.explosive 256; give explosive.timed.deployed 8'
        };
        
        this.setupMiddleware();
        this.setupRoutes();
        // Temporarily disable Discord bot to prevent crashes
        // this.initDiscordBot();
    }

    setupMiddleware() {
        this.app.use(bodyParser.json());
        this.app.use((req, res, next) => {
            // Verify webhook signature
            const signature = req.headers['x-webhook-signature'];
            if (!this.verifySignature(req.body, signature)) {
                return res.status(401).json({ error: 'Invalid signature' });
            }
            next();
        });
    }

    setupRoutes() {
        // Main webhook endpoint
        this.app.post('/webhook', async (req, res) => {
            try {
                const paymentData = req.body;
                console.log('Received payment webhook:', paymentData);

                // Validate payment data
                if (!this.validatePaymentData(paymentData)) {
                    return res.status(400).json({ error: 'Invalid payment data' });
                }

                // Process the payment
                await this.processPayment(paymentData);

                res.status(200).json({ success: true, message: 'Payment processed successfully' });
            } catch (error) {
                console.error('Webhook processing error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Discord OAuth callback
        this.app.get('/discord-callback', async (req, res) => {
            try {
                const { code, state } = req.query;
                const userId = state; // We pass userId as state

                if (!code || !userId) {
                    return res.status(400).json({ error: 'Missing code or state' });
                }

                // Exchange code for Discord user info
                const discordUser = await this.exchangeDiscordCode(code);
                
                if (discordUser) {
                    // Store Discord mapping
                    this.userDiscordMap.set(discordUser.id, userId);
                    this.saveUserDiscordMap();
                    
                    res.send(`
                        <html>
                            <body>
                                <h2>✅ Discord Account Linked!</h2>
                                <p>Your Discord account (${discordUser.username}) has been linked to ${userId}</p>
                                <p>You can now close this window and return to the store.</p>
                                <script>window.close();</script>
                            </body>
                        </html>
                    `);
                } else {
                    res.status(400).json({ error: 'Failed to link Discord account' });
                }
            } catch (error) {
                console.error('Discord callback error:', error);
                res.status(500).json({ error: 'Discord linking failed' });
            }
        });

        // Discord linking API
        this.app.post('/api/discord/link', async (req, res) => {
            try {
                const { code, userId } = req.body;
                
                if (!code || !userId) {
                    return res.status(400).json({ error: 'Missing code or userId' });
                }

                const discordUser = await this.exchangeDiscordCode(code);
                
                if (discordUser) {
                    this.userDiscordMap.set(discordUser.id, userId);
                    this.saveUserDiscordMap();
                    
                    res.json({ 
                        success: true, 
                        discordId: discordUser.id,
                        username: discordUser.username 
                    });
                } else {
                    res.status(400).json({ error: 'Failed to link Discord account' });
                }
            } catch (error) {
                console.error('Discord linking error:', error);
                res.status(500).json({ error: 'Discord linking failed' });
            }
        });

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.status(200).json({ 
                status: 'healthy', 
                timestamp: new Date(),
                payments: this.paymentDatabase.size,
                linkedUsers: this.userDiscordMap.size
            });
        });

        // Payment status endpoint
        this.app.get('/payment/:paymentId', (req, res) => {
            const paymentId = req.params.paymentId;
            const payment = this.paymentDatabase.get(paymentId);
            if (payment) {
                res.json(payment);
            } else {
                res.status(404).json({ error: 'Payment not found' });
            }
        });

        // Manual delivery endpoint
        this.app.post('/api/deliver', async (req, res) => {
            try {
                const { gameId, kitName } = req.body;
                
                if (!gameId || !kitName) {
                    return res.status(400).json({ error: 'Missing gameId or kitName' });
                }

                const command = this.kitCommands[kitName];
                if (!command) {
                    return res.status(400).json({ error: 'Unknown kit' });
                }

                await this.sendRconCommand(gameId, command);
                
                res.json({ success: true, message: `Kit delivered to ${gameId}` });
            } catch (error) {
                console.error('Manual delivery error:', error);
                res.status(500).json({ error: 'Delivery failed' });
            }
        });
    }

    // Initialize Discord bot
    initDiscordBot() {
        // Check if Discord token is valid
        if (!this.discordConfig.token || this.discordConfig.token === 'your_discord_bot_token' || this.discordConfig.token === 'placeholder_token') {
            console.log('⚠️ Discord bot token not configured - Discord features disabled');
            console.log('💡 To enable Discord: Set DISCORD_BOT_TOKEN environment variable');
            return;
        }

        try {
            this.discordClient = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent
                ]
            });

            this.discordClient.on('ready', () => {
                console.log(`🤖 Discord bot logged in as ${this.discordClient.user.tag}`);
            });

            this.discordClient.on('messageCreate', async (message) => {
                if (message.author.bot) return;
                if (message.guild.id !== this.discordConfig.guildId) return;

                await this.handleDiscordMessage(message);
            });

            this.discordClient.login(this.discordConfig.token);
        } catch (error) {
            console.log('⚠️ Discord bot failed to initialize:', error.message);
            console.log('💡 Discord features will be disabled');
        }
    }

    // Handle Discord messages
    async handleDiscordMessage(message) {
        const content = message.content.toLowerCase().trim();
        
        // Handle Discord linking
        if (content.startsWith('!link ')) {
            await this.handleDiscordLink(message);
            return;
        }

        // Handle kit requests
        const kitTriggers = {
            'i need wood': 'Wood Bundle',
            'i need stone': 'Stone Bundle',
            'i need metal': 'Metal Fragments Bundle',
            'i need hqm': 'HQM Bundle',
            'i need cloth': 'Cloth Bundle',
            'i need fuel': 'Low Grade Fuel Bundle',
            'i need scrap': 'Scrap Bundle',
            'i need satchels': 'Beginners Raiding Kit',
            'i need rockets': 'Rookies Rocket Kit',
            'i need c4': 'Demolitioner Kit'
        };

        for (const [trigger, kitName] of Object.entries(kitTriggers)) {
            if (content === trigger) {
                await this.processDiscordKitRequest(message, kitName, trigger);
                return;
            }
        }
    }

    // Handle Discord linking
    async handleDiscordLink(message) {
        const args = message.content.split(' ');
        if (args.length !== 2) {
            await message.reply('❌ Usage: `!link your_game_id`');
            return;
        }

        const gameId = args[1];
        const discordId = message.author.id;

        this.userDiscordMap.set(discordId, gameId);
        this.saveUserDiscordMap();

        await message.reply(`✅ Your Discord account has been linked to **${gameId}**`);
    }

    // Process Discord kit request
    async processDiscordKitRequest(message, kitName, trigger) {
        const discordId = message.author.id;
        const gameId = this.userDiscordMap.get(discordId);

        if (!gameId) {
            await message.reply('❌ Please link your Discord account first using `!link your_game_id`');
            return;
        }

        // Check if user has paid for this kit
        const hasPayment = this.checkPayment(gameId, kitName);
        
        if (!hasPayment) {
            await message.reply('❌ You need to purchase this kit first from our website!');
            return;
        }

        // Deliver kit
        try {
            const command = this.kitCommands[kitName];
            await this.sendRconCommand(gameId, command);
            
            await message.reply(`✅ Kit delivered to **${gameId}**!`);
            this.logDelivery(gameId, kitName, message.author.tag);
        } catch (error) {
            console.error('Kit delivery error:', error);
            await message.reply('❌ Failed to deliver kit. Please contact an administrator.');
        }
    }

    // Exchange Discord OAuth code for user info
    async exchangeDiscordCode(code) {
        try {
            const response = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: this.discordConfig.token,
                    client_secret: 'your_discord_client_secret',
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: 'https://your-domain.com/discord-callback'
                })
            });

            const tokenData = await response.json();
            
            if (tokenData.access_token) {
                // Get user info
                const userResponse = await fetch('https://discord.com/api/users/@me', {
                    headers: {
                        Authorization: `Bearer ${tokenData.access_token}`
                    }
                });

                return await userResponse.json();
            }
        } catch (error) {
            console.error('Discord OAuth error:', error);
        }
        return null;
    }

    // Verify webhook signature
    verifySignature(payload, signature) {
        if (!signature) return false;
        
        const expectedSignature = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(JSON.stringify(payload))
            .digest('hex');
        
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }

    // Validate payment data
    validatePaymentData(paymentData) {
        const requiredFields = ['kitName', 'userId', 'amount', 'status', 'transactionId'];
        return requiredFields.every(field => paymentData[field]);
    }

    // Process payment and store in database
    async processPayment(paymentData) {
        if (paymentData.status !== 'completed') {
            console.log('Payment not completed, skipping processing');
            return;
        }

        // Store payment in database
        this.paymentDatabase.set(paymentData.id, paymentData);
        this.savePaymentDatabase();

        console.log(`Payment processed: ${paymentData.kitName} for ${paymentData.userId}`);

        // Send notification to Discord
        await this.sendDiscordNotification(paymentData);
    }

    // Send Discord notification
    async sendDiscordNotification(paymentData) {
        try {
            if (!this.discordClient) {
                console.log('💬 Discord not available - skipping notification');
                return;
            }
            
            const channel = this.discordClient.channels.cache.get(this.discordConfig.channelId);
            if (channel) {
                await channel.send({
                    embeds: [{
                        color: 0x00FF00,
                        title: '💰 New Payment Received!',
                        description: `**${paymentData.kitName}** purchased by **${paymentData.userId}**`,
                        fields: [
                            { name: 'Amount', value: `$${paymentData.amount}`, inline: true },
                            { name: 'Method', value: paymentData.paymentMethod, inline: true },
                            { name: 'Transaction ID', value: paymentData.transactionId, inline: true }
                        ],
                        timestamp: new Date()
                    }]
                });
            }
        } catch (error) {
            console.error('Discord notification error:', error);
        }
    }

    // Check if user has paid for kit
    checkPayment(gameId, kitName) {
        for (const [paymentId, payment] of this.paymentDatabase) {
            if (payment.userId === gameId && 
                payment.kitName === kitName && 
                payment.status === 'completed') {
                return true;
            }
        }
        return false;
    }

    // Send RCON command to GPortal server
    async sendRconCommand(userId, command) {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            let authenticated = false;

            client.connect(this.rconConfig.port, this.rconConfig.host, () => {
                console.log('Connected to RCON server');
            });

            client.on('data', (data) => {
                const response = this.parseRconResponse(data);
                
                if (!authenticated) {
                    // Send authentication
                    const authPacket = this.createRconPacket(3, this.rconConfig.password);
                    client.write(authPacket);
                    authenticated = true;
                } else {
                    // Send command
                    const fullCommand = `say "Delivering kit to ${userId}"; ${command}`;
                    const commandPacket = this.createRconPacket(2, fullCommand);
                    client.write(commandPacket);
                    
                    // Close connection after command
                    setTimeout(() => {
                        client.destroy();
                        resolve();
                    }, 1000);
                }
            });

            client.on('error', (error) => {
                console.error('RCON connection error:', error);
                reject(error);
            });

            client.on('close', () => {
                console.log('RCON connection closed');
            });
        });
    }

    // Create RCON packet
    createRconPacket(type, payload) {
        const buffer = Buffer.alloc(14 + payload.length);
        buffer.writeInt32LE(10 + payload.length, 0); // Size
        buffer.writeInt32LE(0, 4); // ID
        buffer.writeInt32LE(type, 8); // Type
        buffer.write(payload, 12); // Payload
        buffer.writeInt16LE(0, 12 + payload.length); // Null terminator
        return buffer;
    }

    // Parse RCON response
    parseRconResponse(data) {
        const size = data.readInt32LE(0);
        const id = data.readInt32LE(4);
        const type = data.readInt32LE(8);
        const payload = data.toString('utf8', 12, data.length - 2);
        return { size, id, type, payload };
    }

    // Save payment database
    savePaymentDatabase() {
        // In a real implementation, save to database
        console.log('Payment database saved');
    }

    // Save user Discord mapping
    saveUserDiscordMap() {
        // In a real implementation, save to database
        console.log('User Discord mapping saved');
    }

    // Log delivery
    logDelivery(gameId, kitName, discordUser) {
        console.log(`Kit delivered to ${gameId} (${discordUser}) for ${kitName}`);
    }

    // Start the server
    start(port = process.env.PORT || 3000) {
        this.app.listen(port, () => {
            console.log(`🚀 Automated server running on port ${port}`);
            console.log(`🏥 Health check: http://localhost:${port}/health`);
            console.log(`🔗 Webhook endpoint: http://localhost:${port}/webhook`);
            console.log(`🤖 Discord bot: Disabled (temporarily)`);
            console.log(`🎮 RCON: ${this.rconConfig.host !== 'your_gportal_server_ip' ? 'Configured' : 'Not configured'}`);
            console.log(`💳 Payment system: Ready`);
            console.log(`✅ Server is ready to receive payments!`);
            console.log(`🌐 Server URL: https://store-zad0.onrender.com`);
        });
    }
}

// Export the server
module.exports = AutomatedServer;

// Start server if run directly
if (require.main === module) {
    const server = new AutomatedServer();
    server.start();
} 