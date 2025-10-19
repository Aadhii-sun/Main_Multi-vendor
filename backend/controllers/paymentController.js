const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  const { orderId, amount, currency = 'usd' } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),  // in cents
      currency,
      metadata: { order_id: orderId }
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe payment intent error', error);
    res.status(500).json({ message: 'Payment initiation failed', error: error.message });
  }
};
