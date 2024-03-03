// email
// notification

import { ACCOUNT_SID, AUTHTOKEN, TWILIO_NUMBER } from "../config";

// OTP
export const GenerateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  let expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);

  return { otp, expiry };
};

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
  const accountSid = ACCOUNT_SID;
  const authToken = AUTHTOKEN;
  const client = require("twilio")(accountSid, authToken);

  const response = await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: TWILIO_NUMBER,
    to: `+234${toPhoneNumber}`,
  });

  return response;
};

// Payment notification
