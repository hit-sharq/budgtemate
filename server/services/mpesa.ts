import axios from 'axios';

// M-Pesa API credentials
const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortcode = process.env.MPESA_SHORTCODE;

if (!consumerKey || !consumerSecret || !shortcode) {
  console.error('Missing required M-Pesa credentials');
}

// Base URLs
const BASE_URL = 'https://sandbox.safaricom.co.ke';
const OAUTH_URL = `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
const STK_PUSH_URL = `${BASE_URL}/mpesa/stkpush/v1/processrequest`;

// Get OAuth token
async function getAccessToken(): Promise<string> {
  try {
    // Create auth string from consumer key and secret
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    // Make request to get access token
    const response = await axios.get(OAUTH_URL, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    
    return response.data.access_token;
  } catch (error: any) {
    console.error('Error getting M-Pesa access token:', error.message);
    throw new Error('Failed to authenticate with M-Pesa');
  }
}

// Generate timestamp in required format
function getTimestamp(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}${second}`;
}

// Generate password for STK push
function getPassword(timestamp: string): string {
  const passString = `${shortcode}${process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'}${timestamp}`;
  return Buffer.from(passString).toString('base64');
}

interface STKPushParams {
  phoneNumber: string;
  amount: number;
  callbackUrl: string;
  accountReference: string;
  description: string;
}

// Initiate STK Push payment
export async function initiateSTKPush({
  phoneNumber,
  amount,
  callbackUrl,
  accountReference,
  description,
}: STKPushParams): Promise<any> {
  try {
    // Format phone number (remove leading 0 or +254 and add 254)
    const formattedPhone = phoneNumber.replace(/^(0|\+254)/, '254');
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Generate timestamp
    const timestamp = getTimestamp();
    
    // Generate password
    const password = getPassword(timestamp);
    
    // Prepare request payload
    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: description,
    };
    
    // Make STK push request
    const response = await axios.post(STK_PUSH_URL, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error initiating M-Pesa STK Push:', error.response?.data || error.message);
    throw new Error('Failed to initiate M-Pesa payment');
  }
}

// Check transaction status
export async function checkTransactionStatus(checkoutRequestID: string): Promise<any> {
  try {
    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = getPassword(timestamp);
    
    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };
    
    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error checking M-Pesa transaction status:', error.response?.data || error.message);
    throw new Error('Failed to check M-Pesa transaction status');
  }
}

// For validation and confirmation URLs
export function validateMpesaCallback(data: any): boolean {
  // Implement validation logic based on your requirements
  return true;
}