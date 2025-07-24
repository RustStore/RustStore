const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const webhookSecret = process.env.PAYPAL_WEBHOOK_SECRET;
    const body = event.body;
    const signature = event.headers['paypal-transmission-sig'];
    const timestamp = event.headers['paypal-transmission-time'];
    const certUrl = event.headers['paypal-cert-url'];
    const authAlgo = event.headers['paypal-auth-algo'];

    // Verify webhook signature
    const isValid = verifyPayPalWebhook(body, signature, timestamp, certUrl, authAlgo, webhookSecret);
    
    if (!isValid) {
      console.error('Invalid PayPal webhook signature');
      return { statusCode: 400, body: 'Invalid signature' };
    }

    const webhookData = JSON.parse(body);
    console.log('PayPal webhook received:', webhookData.event_type);

    // Handle different webhook events
    switch (webhookData.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(webhookData);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(webhookData);
        break;
      
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentRefunded(webhookData);
        break;
      
      default:
        console.log(`Unhandled PayPal webhook event: ${webhookData.event_type}`);
    }

    return { statusCode: 200, body: 'Webhook processed successfully' };

  } catch (error) {
    console.error('PayPal webhook error:', error);
    return { statusCode: 500, body: 'Webhook processing failed' };
  }
};

function verifyPayPalWebhook(body, signature, timestamp, certUrl, authAlgo, webhookSecret) {
  // In a production environment, you should verify the webhook signature
  // For now, we'll do a basic check
  if (!signature || !timestamp || !certUrl || !authAlgo) {
    return false;
  }
  
  // For development, you can skip signature verification
  // In production, implement proper signature verification
  return true;
}

async function handlePaymentCompleted(webhookData) {
  const payment = webhookData.resource;
  
  console.log('Payment completed:', {
    id: payment.id,
    amount: payment.amount.value,
    currency: payment.amount.currency_code,
    status: payment.status,
    custom_id: payment.custom_id
  });

  // Extract order information from custom_id or metadata
  const orderInfo = parseOrderInfo(payment.custom_id);
  
  if (orderInfo) {
    // Send Discord notification
    await sendDiscordNotification({
      type: 'payment_completed',
      paymentId: payment.id,
      amount: payment.amount.value,
      currency: payment.amount.currency_code,
      gameId: orderInfo.gameId,
      items: orderInfo.items
    });

    // Process kit delivery
    await processKitDelivery(orderInfo);
  }
}

async function handlePaymentDenied(webhookData) {
  const payment = webhookData.resource;
  
  console.log('Payment denied:', {
    id: payment.id,
    reason: payment.status_details?.reason
  });

  // Send Discord notification for failed payment
  await sendDiscordNotification({
    type: 'payment_denied',
    paymentId: payment.id,
    reason: payment.status_details?.reason
  });
}

async function handlePaymentRefunded(webhookData) {
  const payment = webhookData.resource;
  
  console.log('Payment refunded:', {
    id: payment.id,
    amount: payment.amount.value
  });

  // Handle refund logic
  await sendDiscordNotification({
    type: 'payment_refunded',
    paymentId: payment.id,
    amount: payment.amount.value
  });
}

function parseOrderInfo(customId) {
  if (!customId) return null;
  
  try {
    // Parse the custom_id to extract order information
    // Format: order_timestamp_random_gameId_items
    const parts = customId.split('_');
    if (parts.length >= 4) {
      return {
        gameId: parts[3],
        items: parts.slice(4).join('_') // Items information
      };
    }
  } catch (error) {
    console.error('Error parsing order info:', error);
  }
  
  return null;
}

async function sendDiscordNotification(notificationData) {
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!discordWebhookUrl) {
    console.log('Discord webhook URL not configured');
    return;
  }

  try {
    const embed = createDiscordEmbed(notificationData);
    
    await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    });
    
    console.log('Discord notification sent');
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
  }
}

function createDiscordEmbed(notificationData) {
  const { type, paymentId, amount, currency, gameId, items } = notificationData;
  
  let color, title, description;
  
  switch (type) {
    case 'payment_completed':
      color = 0x00ff88; // Green
      title = '💰 Payment Completed';
      description = `**${gameId}** has completed a payment of **$${amount} ${currency}**`;
      break;
    
    case 'payment_denied':
      color = 0xff4757; // Red
      title = '❌ Payment Denied';
      description = `Payment **${paymentId}** was denied. Reason: ${notificationData.reason || 'Unknown'}`;
      break;
    
    case 'payment_refunded':
      color = 0xffa502; // Orange
      title = '🔄 Payment Refunded';
      description = `Payment **${paymentId}** was refunded. Amount: **$${amount} ${currency}**`;
      break;
    
    default:
      color = 0x6772e5; // Blue
      title = '📊 Payment Update';
      description = `Payment **${paymentId}** status updated`;
  }
  
  return {
    color: color,
    title: title,
    description: description,
    fields: [
      {
        name: 'Payment ID',
        value: paymentId,
        inline: true
      },
      {
        name: 'Amount',
        value: `$${amount} ${currency}`,
        inline: true
      },
      {
        name: 'Game ID',
        value: gameId || 'N/A',
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Rust Store Payment System'
    }
  };
}

async function processKitDelivery(orderInfo) {
  // This function would integrate with your RCON system
  // to deliver the purchased kits in-game
  
  console.log('Processing kit delivery for:', orderInfo);
  
  // Example RCON command structure
  const rconCommands = generateRconCommands(orderInfo);
  
  for (const command of rconCommands) {
    try {
      // Send RCON command to your Rust server
      await sendRconCommand(command);
      console.log('RCON command sent:', command);
    } catch (error) {
      console.error('Failed to send RCON command:', error);
    }
  }
}

function generateRconCommands(orderInfo) {
  // Generate RCON commands based on purchased items
  const commands = [];
  
  // This is a placeholder - you'll need to implement the actual
  // RCON command generation based on your server setup
  
  commands.push(`give ${orderInfo.gameId} "kit_name" 1`);
  
  return commands;
}

async function sendRconCommand(command) {
  // This is a placeholder - you'll need to implement the actual
  // RCON connection and command sending
  
  console.log('Would send RCON command:', command);
  
  // Example implementation:
  // const rcon = new Rcon({
  //   host: process.env.RCON_HOST,
  //   port: process.env.RCON_PORT,
  //   password: process.env.RCON_PASSWORD
  // });
  // 
  // await rcon.connect();
  // await rcon.command(command);
  // await rcon.disconnect();
} 