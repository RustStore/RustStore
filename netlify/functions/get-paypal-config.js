exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Only return the PayPal Client ID (safe for frontend use)
    const paypalConfig = {
      clientId: process.env.PAYPAL_CLIENT_ID
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(paypalConfig)
    };

  } catch (error) {
    console.error('Error getting PayPal config:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get PayPal configuration' })
    };
  }
}; 