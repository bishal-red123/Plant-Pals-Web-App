const axios = require('axios');

// A simple script to verify Stripe API keys
async function verifyStripeKey() {
  try {
    console.log("Testing Stripe login...");
    // Use the STRIPE_SECRET_KEY environment variable
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      console.error("❌ STRIPE_SECRET_KEY is not set in environment variables");
      return;
    }

    // Check if it's a publishable key (starts with pk_)
    if (secretKey.startsWith('pk_')) {
      console.error("❌ ERROR: STRIPE_SECRET_KEY is a publishable key (starts with pk_)");
      console.error("   You need to provide a secret key (starts with sk_)");
      return;
    }

    // Attempt to make a simple API call to verify the key
    const response = await axios.get('https://api.stripe.com/v1/balance', {
      headers: {
        'Authorization': `Bearer ${secretKey}`
      }
    });

    if (response.status === 200) {
      console.log("✅ Stripe key is valid!");
      console.log("Available balance:", response.data.available[0].amount / 100, response.data.available[0].currency.toUpperCase());
    } else {
      console.error("❌ Unexpected response from Stripe API:", response.status);
    }
  } catch (error) {
    console.error("❌ Error verifying Stripe key:");
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Message: ${error.response.data.error.message}`);
    } else {
      console.error(error.message);
    }
  }
}

verifyStripeKey();