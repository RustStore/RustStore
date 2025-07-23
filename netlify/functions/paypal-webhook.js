const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = event.body;
    const headers = event.headers;
    
    // Verify PayPal webhook signature
    const transmissionId = headers['paypal-transmission-id'];
    const timestamp = headers['paypal-transmission-time'];
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const certUrl = headers['paypal-cert-url'];
    const authAlgo = headers['paypal-auth-algo'];
    const transmissionSig = headers['paypal-transmission-sig'];

    // For now, we'll process without signature verification
    // In production, you should implement proper signature verification
    
    const webhookData = JSON.parse(body);
    
    switch (webhookData.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        console.log('PayPal payment completed:', webhookData.resource.id);
        
        // Here you would typically:
        // 1. Update your database
        // 2. Send Discord notification
        // 3. Execute RCON command to deliver kit
        
        break;
        
      case 'PAYMENT.CAPTURE.DENIED':
        console.log('PayPal payment denied:', webhookData.resource.id);
        break;
        
      default:
        console.log(`Unhandled PayPal event: ${webhookData.event_type}`);
    }

    return { statusCode: 200, body: 'PayPal webhook processed successfully' };
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    return { statusCode: 500, body: 'PayPal webhook processing failed' };
  }
}; 