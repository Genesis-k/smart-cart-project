const axios = require('axios');
const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel'); 

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
  // FIXED: Destructured 'phone' instead of 'phoneNumber' to match your frontend React payload
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

  // Format phone number safely
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
    Amount: 1, 
    PartyA: formattedPhone, 
    PartyB: shortCode, 
    PhoneNumber: formattedPhone,
    // Safaricom will send the success/fail data to this exact URL
    CallBackURL: `${process.env.MPESA_CALLBACK_URL}/api/mpesa/callback/${orderId}`, 
    AccountReference: `Vivo${cleanOrderId}`, 
    TransactionDesc: 'Merchandise Payment',
  };

  try {
    const response = await axios.post(stk_url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Optional: You could save response.data.CheckoutRequestID to the Order here if you want to track it
    res.json(response.data);

  } catch (error) {
    console.error("STK Push Error:", error.response ? error.response.data : error.message);
    res.status(400);
    throw new Error('STK Push Failed. Check server logs.');
  }
});

// 3. Handle Safaricom's Callback (NEW)
// 3. Handle Safaricom's Callback
const mpesaCallback = asyncHandler(async (req, res) => {
  console.log('--- M-PESA CALLBACK HIT ---');
  
  const orderId = req.params.id; // Grab the ID from the URL we created
  const callbackData = req.body.Body.stkCallback;
  
  if (callbackData.ResultCode === 0) {
    // 1. Payment was successful, extract the data
    const metadata = callbackData.CallbackMetadata.Item;
    const mpesaReceipt = metadata.find(item => item.Name === 'MpesaReceiptNumber').Value;
    
    console.log(`Success! Receipt: ${mpesaReceipt} for Order: ${orderId}`);
    
    // 2. Find the Order in MongoDB
    const order = await Order.findById(orderId);

    if (order) {
      // 3. Update the order to Paid
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: mpesaReceipt,
        status: 'Completed',
        update_time: Date.now(),
        email_address: callbackData.MerchantRequestID, // Using this as a reference
      };

      await order.save();
      console.log('Database updated successfully! Order marked as paid.');
    } else {
      console.error('Order not found in database!');
    }

  } else {
    // Customer cancelled, insufficient funds, or timed out.
    console.log('Payment Failed:', callbackData.ResultDesc);
  }

  // Always respond to Safaricom with 200 OK immediately
  res.status(200).json({ message: 'Callback received successfully' });
});

module.exports = { stkPush, mpesaCallback };