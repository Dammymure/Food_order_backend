// email
// notification
// OTP
export const GenerateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  let expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);

  return { otp, expiry };
};

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
  const accountSid = "ACe5f8edddd5ad84e55eadb23cd9eff07d";
  const authToken = "58ccc5e08d9a01fe5a7028a98517a760";
  const client = require("twilio")(accountSid, authToken);

  const response = await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: "+19285646728",
    to: `+234${toPhoneNumber}`,
  });

  return response;
};

// Payment notification
