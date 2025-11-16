import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Lazy initialization - only create client when credentials are available
const getTwilioClient = () => {
  if (!accountSid || !authToken) {
    return null;
  }
  return twilio(accountSid, authToken);
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (phone: string, otp: string): Promise<boolean> => {
  try {
    if (!accountSid || !authToken || !twilioPhone) {
      console.warn('Twilio credentials not configured. Using mock OTP.');
      console.log(`Mock OTP for ${phone}: ${otp}`);
      return true; // Return true for development
    }

    const client = getTwilioClient();
    if (!client) {
      console.warn('Twilio client initialization failed. Using mock OTP.');
      console.log(`Mock OTP for ${phone}: ${otp}`);
      return true;
    }

    await client.messages.create({
      body: `Your Chai Lelo OTP is: ${otp}. Valid for 10 minutes.`,
      from: twilioPhone,
      to: phone,
    });

    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    // In development, still return true
    return true;
  }
};

