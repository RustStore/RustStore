const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount, email, gameId, items } = JSON.parse(event.body);

    // Validate required fields
    if (!amount || !email || !gameId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: amount, email, gameId' })
      };
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'usd',
      metadata: {
        email: email,
        gameId: gameId,
        items: JSON.stringify(items.map(item => ({
          name: item.item.name,
          type: item.item.type || item.item.resourceType,
          quantity: item.quantity,
          price: item.item.price
        })))
      },
      receipt_email: email,
      description: `Rust Store Purchase - ${items.map(item => item.item.name).join(', ')}`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      })
    };

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create payment intent' })
    };
  }
}; 