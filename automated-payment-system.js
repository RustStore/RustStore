// Fully Automated Payment System for Rust Store
// Integrates Discord bots + GPortal RCON for automatic delivery
// Users pay → Use predetermined message → Auto delivery

class AutomatedPaymentSystem {
    constructor() {
        this.paypalEmail = 'your_paypal_email@example.com'; // Replace with your PayPal email
        this.cashAppTag = '$YourCashAppTag'; // Replace with your Cash App $Cashtag
        this.webhookUrl = 'https://your-domain.com/webhook'; // Replace with your webhook URL
        this.discordBotToken = 'your_discord_bot_token'; // Replace with your Discord bot token
        this.discordGuildId = 'your_discord_server_id'; // Replace with your Discord server ID
        this.database = this.loadDatabase();
        this.pendingPayments = new Map();
        this.userDiscordMap = new Map(); // Maps game IDs to Discord IDs
        this.initPaymentSDKs();
    }

    // Initialize payment SDKs for personal accounts
    initPaymentSDKs() {
        // For personal accounts, we'll use manual payment instructions
        // but still maintain the automated delivery system
        console.log('Personal account payment system initialized');
    }

    // Show payment modal with Discord integration for personal accounts
    showPaymentModal(kitName, price, userId) {
        this.currentPayment = {
            kitName: kitName,
            amount: price,
            userId: userId,
            timestamp: new Date(),
            status: 'pending'
        };

        const modal = document.createElement('div');
        modal.className = 'payment-modal-overlay';
        modal.innerHTML = `
            <div class="payment-modal">
                <div class="payment-header">
                    <h2>Purchase ${kitName}</h2>
                    <button class="close-btn" onclick="automatedPaymentSystem.closePaymentModal()">×</button>
                </div>
                <div class="payment-content">
                    <div class="payment-info">
                        <h3>Kit: ${kitName}</h3>
                        <p class="price">$${price}</p>
                        <p class="user-id">Game ID: ${userId}</p>
                    </div>
                    
                    <div class="discord-integration">
                        <h4>Discord Integration</h4>
                        <p>Link your Discord account for automatic delivery:</p>
                        <button class="discord-btn" onclick="automatedPaymentSystem.linkDiscord('${userId}')">
                            <i class="fab fa-discord"></i> Link Discord Account
                        </button>
                        <p class="discord-note">After payment, use predetermined messages in Discord to claim your kit!</p>
                    </div>
                    
                    <div class="payment-methods">
                        <div class="payment-method">
                            <h4>PayPal</h4>
                            <div class="payment-instructions">
                                <p><strong>Send $${price} to:</strong></p>
                                <p class="payment-detail">${this.paypalEmail}</p>
                                <p><strong>Important:</strong> Include your Gamertag in the payment note!</p>
                                <p class="example">Example note: "${kitName} - ${userId}"</p>
                            </div>
                            <button class="paypal-btn" onclick="automatedPaymentSystem.openPayPal('${kitName}', ${price}, '${userId}')">
                                <i class="fab fa-paypal"></i> Send via PayPal
                            </button>
                        </div>
                        
                        <div class="payment-method">
                            <h4>Cash App</h4>
                            <div class="payment-instructions">
                                <p><strong>Send $${price} to:</strong></p>
                                <p class="payment-detail">${this.cashAppTag}</p>
                                <p><strong>Important:</strong> Include your Gamertag in the payment note!</p>
                                <p class="example">Example note: "${kitName} - ${userId}"</p>
                            </div>
                            <button class="cashapp-btn" onclick="automatedPaymentSystem.openCashApp('${kitName}', ${price}, '${userId}')">
                                <i class="fas fa-dollar-sign"></i> Send via Cash App
                            </button>
                        </div>
                    </div>
                    
                    <div class="payment-verification">
                        <p class="verification-note">
                            <i class="fas fa-info-circle"></i>
                            After sending payment, click the button below to verify your purchase.
                        </p>
                        <button class="verify-btn" onclick="automatedPaymentSystem.verifyPayment('${kitName}', '${userId}')">
                            <i class="fas fa-check"></i> I've Sent Payment - Verify Purchase
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.initPaymentSDKs();
    }

    // Link Discord account
    async linkDiscord(userId) {
        const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${this.discordBotToken}&redirect_uri=${encodeURIComponent(window.location.origin + '/discord-callback')}&response_type=code&scope=identify`;
        
        // Open Discord OAuth
        window.open(discordAuthUrl, '_blank', 'width=500,height=600');
        
        // Store pending Discord link
        this.pendingDiscordLinks.set(userId, {
            timestamp: new Date(),
            status: 'pending'
        });
    }

    // Handle Discord callback
    async handleDiscordCallback(code, userId) {
        try {
            const response = await fetch('/api/discord/link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: code,
                    userId: userId
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.userDiscordMap.set(userId, data.discordId);
                this.showSuccess('Discord account linked successfully!');
            } else {
                this.showError('Failed to link Discord account.');
            }
        } catch (error) {
            console.error('Discord linking error:', error);
            this.showError('Discord linking failed.');
        }
    }

    // Open PayPal for personal account
    openPayPal(kitName, price, userId) {
        // Open PayPal in new window/tab
        const paypalUrl = `https://www.paypal.com/send?cmd=_send-money&amount=${price}&recipient=${encodeURIComponent(this.paypalEmail)}&note=${encodeURIComponent(`${kitName} - ${userId}`)}`;
        window.open(paypalUrl, '_blank');
        
        // Store pending payment
        this.pendingPayments.set(`${kitName}-${userId}`, {
            kitName: kitName,
            price: price,
            userId: userId,
            timestamp: new Date(),
            status: 'pending',
            method: 'paypal'
        });
    }

    // Open Cash App for personal account
    openCashApp(kitName, price, userId) {
        // Open Cash App in new window/tab
        const cashAppUrl = `https://cash.app/$${this.cashAppTag.replace('$', '')}/${price}`;
        window.open(cashAppUrl, '_blank');
        
        // Store pending payment
        this.pendingPayments.set(`${kitName}-${userId}`, {
            kitName: kitName,
            price: price,
            userId: userId,
            timestamp: new Date(),
            status: 'pending',
            method: 'cashapp'
        });
    }

    // Verify payment (manual verification for personal accounts)
    verifyPayment(kitName, userId) {
        const paymentKey = `${kitName}-${userId}`;
        const pendingPayment = this.pendingPayments.get(paymentKey);
        
        if (!pendingPayment) {
            this.showError('No pending payment found. Please try purchasing again.');
            return;
        }

        // Show verification modal for admin
        this.showVerificationModal(kitName, userId, pendingPayment);
    }

    // Show verification modal for admin to confirm
    showVerificationModal(kitName, userId, paymentInfo) {
        const modal = document.createElement('div');
        modal.className = 'verification-modal-overlay';
        modal.innerHTML = `
            <div class="verification-modal">
                <div class="verification-header">
                    <h3>Payment Verification</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="verification-content">
                    <div class="payment-details">
                        <h4>Payment Details:</h4>
                        <p><strong>Kit:</strong> ${kitName}</p>
                        <p><strong>User:</strong> ${userId}</p>
                        <p><strong>Amount:</strong> $${paymentInfo.price}</p>
                        <p><strong>Method:</strong> ${paymentInfo.method}</p>
                        <p><strong>Time:</strong> ${paymentInfo.timestamp.toLocaleString()}</p>
                    </div>
                    
                    <div class="verification-steps">
                        <h4>Verification Steps:</h4>
                        <ol>
                            <li>Check your ${paymentInfo.method === 'paypal' ? 'PayPal' : 'Cash App'} for payment</li>
                            <li>Verify the payment note matches: "${kitName} - ${userId}"</li>
                            <li>Confirm the amount is $${paymentInfo.price}</li>
                            <li>Click "Confirm Payment" below</li>
                        </ol>
                    </div>
                    
                    <div class="verification-actions">
                        <button class="confirm-btn" onclick="automatedPaymentSystem.confirmPayment('${kitName}', '${userId}')">
                            <i class="fas fa-check"></i> Confirm Payment & Enable Delivery
                        </button>
                        <button class="reject-btn" onclick="automatedPaymentSystem.rejectPayment('${kitName}', '${userId}')">
                            <i class="fas fa-times"></i> Reject Payment
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Confirm payment and enable automated delivery
    confirmPayment(kitName, userId) {
        const paymentKey = `${kitName}-${userId}`;
        const pendingPayment = this.pendingPayments.get(paymentKey);
        
        if (!pendingPayment) {
            this.showError('Payment not found.');
            return;
        }

        // Create payment record
        const paymentRecord = {
            id: this.generatePaymentId(),
            kitName: kitName,
            amount: pendingPayment.price,
            userId: userId,
            discordId: this.userDiscordMap.get(userId),
            paymentMethod: pendingPayment.method,
            status: 'completed',
            timestamp: new Date(),
            transactionId: `manual_${Date.now()}`,
            paymentDetails: pendingPayment
        };

        // Save to database
        this.savePaymentRecord(paymentRecord);

        // Send webhook to server for Discord bot integration
        this.sendWebhook(paymentRecord);

        // Remove from pending
        this.pendingPayments.delete(paymentKey);

        // Show success message
        this.showSuccess(paymentRecord);

        // Close verification modal
        const verificationModal = document.querySelector('.verification-modal-overlay');
        if (verificationModal) {
            verificationModal.remove();
        }

        // Close payment modal
        this.closePaymentModal();
    }

    // Reject payment
    rejectPayment(kitName, userId) {
        const paymentKey = `${kitName}-${userId}`;
        this.pendingPayments.delete(paymentKey);
        
        this.showError('Payment rejected. Please try again or contact support.');
        
        // Close verification modal
        const verificationModal = document.querySelector('.verification-modal-overlay');
        if (verificationModal) {
            verificationModal.remove();
        }
    }

    // Handle successful payment
    handlePaymentSuccess(paymentDetails, method) {
        const paymentRecord = {
            id: this.generatePaymentId(),
            kitName: this.currentPayment.kitName,
            amount: this.currentPayment.amount,
            userId: this.currentPayment.userId,
            discordId: this.userDiscordMap.get(this.currentPayment.userId),
            paymentMethod: method,
            status: 'completed',
            timestamp: new Date(),
            transactionId: paymentDetails.id || paymentDetails.transaction_id,
            paymentDetails: paymentDetails
        };

        // Save to database
        this.savePaymentRecord(paymentRecord);

        // Send webhook to server for Discord bot integration
        this.sendWebhook(paymentRecord);

        // Show success message
        this.showSuccess(paymentRecord);

        // Close modal
        this.closePaymentModal();
    }

    // Handle payment error
    handlePaymentError(error, method) {
        console.error(`${method} payment error:`, error);
        this.showError(`Payment failed. Please try again. Error: ${error.message}`);
    }

    // Send webhook to server
    async sendWebhook(paymentRecord) {
        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer your_webhook_secret'
                },
                body: JSON.stringify(paymentRecord)
            });

            if (!response.ok) {
                throw new Error(`Webhook failed: ${response.status}`);
            }

            console.log('Webhook sent successfully');
        } catch (error) {
            console.error('Webhook error:', error);
            this.storeFailedWebhook(paymentRecord);
        }
    }

    // Database operations
    loadDatabase() {
        const stored = localStorage.getItem('rust_store_payments');
        return stored ? JSON.parse(stored) : [];
    }

    savePaymentRecord(record) {
        this.database.push(record);
        localStorage.setItem('rust_store_payments', JSON.stringify(this.database));
    }

    // Utility functions
    generatePaymentId() {
        return 'payment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    storeFailedWebhook(paymentRecord) {
        const failedWebhooks = JSON.parse(localStorage.getItem('failed_webhooks') || '[]');
        failedWebhooks.push({
            paymentRecord: paymentRecord,
            timestamp: new Date(),
            retryCount: 0
        });
        localStorage.setItem('failed_webhooks', JSON.stringify(failedWebhooks));
    }

    // UI functions
    showSuccess(paymentRecord) {
        const successModal = document.createElement('div');
        successModal.className = 'success-modal-overlay';
        successModal.innerHTML = `
            <div class="success-modal">
                <div class="success-icon">✓</div>
                <h3>Payment Successful!</h3>
                <p>Your ${paymentRecord.kitName} is ready for pickup!</p>
                <p>Game ID: ${paymentRecord.userId}</p>
                <p>Transaction ID: ${paymentRecord.transactionId}</p>
                <div class="claim-instructions">
                    <h4>How to Claim:</h4>
                    <ol>
                        <li>Join the Rust server</li>
                        <li>Type the predetermined message for your kit</li>
                        <li>Example: "i need wood" for Wood Bundle</li>
                        <li>Your kit will be delivered automatically!</li>
                    </ol>
                </div>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(successModal);
    }

    showError(message) {
        const errorModal = document.createElement('div');
        errorModal.className = 'error-modal-overlay';
        errorModal.innerHTML = `
            <div class="error-modal">
                <div class="error-icon">✗</div>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(errorModal);
    }

    closePaymentModal() {
        const modal = document.querySelector('.payment-modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    // Get payment history
    getPaymentHistory(userId = null) {
        if (userId) {
            return this.database.filter(payment => payment.userId === userId);
        }
        return this.database;
    }

    // Check if user has active payment
    hasActivePayment(userId, kitName) {
        return this.database.some(payment => 
            payment.userId === userId && 
            payment.kitName === kitName && 
            payment.status === 'completed'
        );
    }
}

// Initialize automated payment system
const automatedPaymentSystem = new AutomatedPaymentSystem();

// Export for use in other files
window.automatedPaymentSystem = automatedPaymentSystem; 