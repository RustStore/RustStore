// Discord Bot for Automated Kit Delivery
// Monitors server messages and delivers kits automatically

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const net = require('net');

class RustDiscordBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        this.config = {
            token: 'your_discord_bot_token', // Replace with your bot token
            guildId: 'your_discord_server_id', // Replace with your server ID
            channelId: 'your_channel_id', // Replace with your channel ID
            rconConfig: {
                host: 'your_gportal_server_ip',
                port: 28016,
                password: 'your_rcon_password'
            }
        };

        this.kitCommands = {
            'i need wood': 'give wood 10000',
            'i need stone': 'give stone 10000',
            'i need metal': 'give metal.fragments 10000',
            'i need hqm': 'give metal.refined 1000',
            'i need cloth': 'give cloth 10000',
            'i need fuel': 'give fuel 1000',
            'i need scrap': 'give scrap 10000',
            'i need satchels': 'give satchel.charge 12; give ammo.explosive 256',
            'i need rockets': 'give rocket.launcher 1; give rocket.basic 9',
            'i need c4': 'give explosive.timed.deployed 6'
        };

        this.paymentDatabase = new Map(); // Store payment records
        this.userDiscordMap = new Map(); // Map Discord IDs to game IDs
        this.setupEventHandlers();
    }

    // Setup Discord event handlers
    setupEventHandlers() {
        this.client.on('ready', () => {
            console.log(`Discord bot logged in as ${this.client.user.tag}`);
            this.loadPaymentDatabase();
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            if (message.guild.id !== this.config.guildId) return;

            await this.handleMessage(message);
        });

        this.client.on('guildMemberAdd', (member) => {
            this.handleNewMember(member);
        });
    }

    // Handle incoming messages
    async handleMessage(message) {
        const content = message.content.toLowerCase().trim();
        
        // Check if message matches any kit command
        for (const [trigger, command] of Object.entries(this.kitCommands)) {
            if (content === trigger) {
                await this.processKitRequest(message, trigger, command);
                return;
            }
        }

        // Handle Discord linking
        if (content.startsWith('!link ')) {
            await this.handleDiscordLink(message);
            return;
        }

        // Handle admin commands
        if (message.member.permissions.has('ADMINISTRATOR')) {
            await this.handleAdminCommands(message);
        }
    }

    // Process kit request
    async processKitRequest(message, trigger, command) {
        const userId = message.author.id;
        const gameId = this.userDiscordMap.get(userId);

        if (!gameId) {
            await message.reply('❌ Please link your Discord account first using `!link your_game_id`');
            return;
        }

        // Check if user has paid for this kit
        const hasPayment = this.checkPayment(gameId, trigger);
        
        if (!hasPayment) {
            await message.reply('❌ You need to purchase this kit first from our website!');
            return;
        }

        // Deliver kit via RCON
        try {
            await this.deliverKit(gameId, command);
            
            // Send success message
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Kit Delivered!')
                .setDescription(`Your kit has been delivered to **${gameId}**`)
                .addFields(
                    { name: 'Kit', value: this.getKitName(trigger), inline: true },
                    { name: 'Game ID', value: gameId, inline: true },
                    { name: 'Command', value: trigger, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [embed] });

            // Log delivery
            this.logDelivery(gameId, trigger, message.author.tag);

        } catch (error) {
            console.error('Kit delivery error:', error);
            await message.reply('❌ Failed to deliver kit. Please contact an administrator.');
        }
    }

    // Handle Discord account linking
    async handleDiscordLink(message) {
        const args = message.content.split(' ');
        if (args.length !== 2) {
            await message.reply('❌ Usage: `!link your_game_id`');
            return;
        }

        const gameId = args[1];
        const discordId = message.author.id;

        // Store the mapping
        this.userDiscordMap.set(discordId, gameId);
        this.saveUserDiscordMap();

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🔗 Account Linked!')
            .setDescription(`Your Discord account has been linked to **${gameId}**`)
            .addFields(
                { name: 'Discord', value: message.author.tag, inline: true },
                { name: 'Game ID', value: gameId, inline: true }
            )
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    // Handle admin commands
    async handleAdminCommands(message) {
        const content = message.content.toLowerCase();

        if (content === '!stats') {
            await this.showStats(message);
        } else if (content.startsWith('!deliver ')) {
            await this.manualDelivery(message);
        } else if (content === '!help') {
            await this.showHelp(message);
        }
    }

    // Show bot statistics
    async showStats(message) {
        const totalPayments = this.paymentDatabase.size;
        const totalDeliveries = this.getDeliveryCount();
        const linkedUsers = this.userDiscordMap.size;

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('📊 Bot Statistics')
            .addFields(
                { name: 'Total Payments', value: totalPayments.toString(), inline: true },
                { name: 'Total Deliveries', value: totalDeliveries.toString(), inline: true },
                { name: 'Linked Users', value: linkedUsers.toString(), inline: true }
            )
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    // Manual kit delivery
    async manualDelivery(message) {
        const args = message.content.split(' ');
        if (args.length !== 3) {
            await message.reply('❌ Usage: `!deliver game_id kit_name`');
            return;
        }

        const gameId = args[1];
        const kitName = args[2];

        try {
            await this.deliverKit(gameId, this.kitCommands[kitName]);
            await message.reply(`✅ Kit delivered to ${gameId}`);
        } catch (error) {
            await message.reply('❌ Failed to deliver kit');
        }
    }

    // Show help
    async showHelp(message) {
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🤖 Rust Store Bot Help')
            .setDescription('Available commands and features')
            .addFields(
                { name: 'User Commands', value: '`!link game_id` - Link your Discord to game ID\n`i need wood` - Claim wood kit\n`i need stone` - Claim stone kit\n`i need metal` - Claim metal kit' },
                { name: 'Admin Commands', value: '`!stats` - Show bot statistics\n`!deliver game_id kit` - Manual delivery\n`!help` - Show this help' },
                { name: 'Available Kits', value: 'wood, stone, metal, hqm, cloth, fuel, scrap, satchels, rockets, c4' }
            )
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    // Check if user has paid for kit
    checkPayment(gameId, trigger) {
        const kitName = this.getKitName(trigger);
        
        for (const [paymentId, payment] of this.paymentDatabase) {
            if (payment.userId === gameId && 
                payment.kitName === kitName && 
                payment.status === 'completed') {
                return true;
            }
        }
        return false;
    }

    // Deliver kit via RCON
    async deliverKit(gameId, command) {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            let authenticated = false;

            client.connect(this.config.rconConfig.port, this.config.rconConfig.host, () => {
                console.log('Connected to RCON server');
            });

            client.on('data', (data) => {
                const response = this.parseRconResponse(data);
                
                if (!authenticated) {
                    // Send authentication
                    const authPacket = this.createRconPacket(3, this.config.rconConfig.password);
                    client.write(authPacket);
                    authenticated = true;
                } else {
                    // Send command
                    const fullCommand = `say "Delivering kit to ${gameId}"; ${command}`;
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

    // Get kit name from trigger
    getKitName(trigger) {
        const kitMap = {
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
        return kitMap[trigger] || 'Unknown Kit';
    }

    // Load payment database
    loadPaymentDatabase() {
        // In a real implementation, load from database
        console.log('Payment database loaded');
    }

    // Save user Discord mapping
    saveUserDiscordMap() {
        // In a real implementation, save to database
        console.log('User Discord mapping saved');
    }

    // Log delivery
    logDelivery(gameId, trigger, discordUser) {
        console.log(`Kit delivered to ${gameId} (${discordUser}) for ${trigger}`);
    }

    // Get delivery count
    getDeliveryCount() {
        // In a real implementation, count from database
        return 0;
    }

    // Handle new member
    handleNewMember(member) {
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('👋 Welcome!')
            .setDescription(`Welcome ${member.user.tag} to the server!`)
            .addFields(
                { name: 'Next Steps', value: '1. Link your Discord account using `!link your_game_id`\n2. Purchase kits from our website\n3. Use predetermined messages in-game to claim kits!' }
            )
            .setTimestamp();

        const channel = member.guild.channels.cache.get(this.config.channelId);
        if (channel) {
            channel.send({ embeds: [embed] });
        }
    }

    // Start the bot
    start() {
        this.client.login(this.config.token);
    }
}

// Export the bot
module.exports = RustDiscordBot;

// Start bot if run directly
if (require.main === module) {
    const bot = new RustDiscordBot();
    bot.start();
} 