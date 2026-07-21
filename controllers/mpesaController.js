const axios = require('axios');
const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel'); // ADD THIS IMPORT

// 1. Generate Access Token
const getAccessToken = async () => {
  const consumer_key = process.env.MPESA_CONSUMER_KEY;
  const consumer_secret = process.env.MPESA_CONSUMER_SECRET;
  const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth = 'Basic ' + Buffer.from(consumer_key + ':' + consumer_secret).toString('base64');

  try {
    const response = await axios.get(url, {
      headers: { Authorization: auth },
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Access Token Error:", error.response ? error.response.data : error.message);
    throw new Error('Failed to get Access Token');
  }
};

// 2. Trigger STK Push
const stkPush = asyncHandler(async (req, res) => {
  const { phone, amount, orderId } = req.body;
  const token = await getAccessToken();

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2);

  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');

  const stk_url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  const formattedPhone = phone.startsWith('0')
    ? '254' + phone.substring(1)
    : phone.startsWith('+')
    ? phone.substring(1)
    : phone;

  const cleanOrderId = orderId.toString().substring(0, 10);

  const data = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: process.env.MPESA_TEST_MODE === 'true' ? 1 : Math.round(amount),
    PartyA: formattedPhone,
    PartyB: shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: `${process.env.MPESA_CALLBACK_URL}/api/payments/callback/${orderId}`,
    AccountReference: `Merch${cleanOrderId}`,
    TransactionDesc: 'Merchandise Payment',
  };

  console.log("PAYLOAD BEING SENT TO SAFARICOM:", data);

  try {
    const response = await axios.post(stk_url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(response.data);

  } catch (error) {
    console.error("STK Push Error:", error.response ? error.response.data : error.message);
    res.status(400);
    throw new Error('STK Push Failed. Check server logs.');
  }
});

// 3. Handle Safaricom's Callback
const mpesaCallback = async (req, res) => {
  console.log('--- M-PESA CALLBACK HIT ---');

  // 1. INSTANTLY respond to Safaricom to prevent reversals!
  res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Success"
  });

  // 2. Now process the database update in the background
  try {
    const orderId = req.params.id;
    const callbackData = req.body.Body.stkCallback;

    if (callbackData.ResultCode === 0) {
      // Payment was successful, extract the data
      const metadata = callbackData.CallbackMetadata.Item;
      const mpesaReceipt = metadata.find(item => item.Name === 'MpesaReceiptNumber').Value;

      console.log(`Success! Receipt: ${mpesaReceipt} for Order: ${orderId}`);

      // Find the Order in MongoDB
      const order = await Order.findById(orderId);

      if (order) {
        // Update the order to Paid
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: mpesaReceipt,
          status: 'Completed',
          update_time: Date.now(),
          email_address: callbackData.MerchantRequestID,
        };

        await order.save();
        console.log('Database updated successfully! Order marked as paid.');

        // ══════════════════════════════════════════
        // DEDUCT STOCK FOR EACH ITEM IN THE ORDER
        // ══════════════════════════════════════════
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            product.countInStock = product.countInStock - item.qty;
            if (product.countInStock < 0) product.countInStock = 0;
            await product.save();
            console.log(`Stock updated: ${product.name} now has ${product.countInStock} left`);
          }
        }
      } else {
        console.error('Order not found in database!');
      }

    } else {
      console.log('Payment Failed:', callbackData.ResultDesc);
    }
  } catch (error) {
    console.error("Error processing Safaricom database update:", error.message);
  }
};

module.exports = { stkPush, mpesaCallback };