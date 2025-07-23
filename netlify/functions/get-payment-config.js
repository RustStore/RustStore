exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Return only the public keys (safe to expose)
    const config = {
      paypalClientId: process.env.PAYPAL_CLIENT_ID,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(config)
    };
  } catch (error) {
    console.error('Error getting payment config:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get payment configuration' })
    };
  }
}; 