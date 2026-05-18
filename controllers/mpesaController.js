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
  const { phoneNumber, amount, orderId } = req.body;
  const token = await getAccessToken();
  
  // Date format required by Safaricom: YYYYMMDDHHmmss
  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2);

  // In Sandbox, this is ALWAYS 174379
  const shortCode = process.env.MPESA_SHORTCODE; 
  const passkey = process.env.MPESA_PASSKEY;
  const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');

  const stk_url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  // Format phone number to 254xxxxxxxxx (Remove '0' or '+')
  const formattedPhone = phoneNumber.startsWith('0') 
    ? '254' + phoneNumber.substring(1) 
    : phoneNumber.startsWith('+')
    ? phoneNumber.substring(1)
    : phoneNumber;

  // Account Reference cannot be longer than 12 characters or contain special chars in some cases
  // We clean it up here to prevent API errors
  const cleanOrderId = orderId.toString().substring(0, 10); 

  const data = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline', // This acts as a "Buy Goods" for the user
    Amount: Math.floor(amount), // Amount must be an integer (no decimals)
    PartyA: formattedPhone, // Customer Phone
    PartyB: shortCode, // The Sandbox Shortcode (174379)
    PhoneNumber: formattedPhone,
    CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://mydomain.com/api/mpesa/callback', 
    AccountReference: `Vivo${cleanOrderId}`, // Max 12 characters, no spaces
    TransactionDesc: 'Payment',
  };

  try {
    const response = await axios.post(stk_url, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log("M-Pesa Response:", response.data);
    res.json(response.data);

  } catch (error) {
    console.error("STK Push Error:", error.response ? error.response.data : error.message);
    res.status(400);
    throw new Error('STK Push Failed. Check server logs.');
  }
});

module.exports = { stkPush };