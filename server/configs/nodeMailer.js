import nodemailer from "nodemailer";

// Create a transporter object using the SMTP settings
console.log("SMTP_USER Available:", !!process.env.SMTP_USER);
console.log("SMTP_PASS Available:", !!process.env.SMTP_PASS);

if (!process.env.SMTP_USER) {
  console.error("FATAL ERROR: SMTP_USER is undefined in process.env");
}

if (!process.env.SMTP_PASS) {
  console.error("FATAL ERROR: SMTP_PASS is undefined in process.env");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, body }) => {
  const response = await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    html: body,
  });
  return response;
};

export default sendEmail;
