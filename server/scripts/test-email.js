import "dotenv/config";
import sendEmail from "../configs/nodeMailer.js";

const testEmail = async () => {
    console.log("Attempting to send test email...");
    console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
    console.log(`SENDER_EMAIL: ${process.env.SENDER_EMAIL}`);

    if (
        !process.env.SMTP_USER ||
        process.env.SMTP_USER === "dummy" ||
        !process.env.SMTP_PASS ||
        process.env.SMTP_PASS === "dummy"
    ) {
        console.error(
            "ERROR: SMTP credentials are not set or are set to 'dummy' in .env file."
        );
        console.error(
            "Please update server/.env with valid SMTP_USER, SMTP_PASS, and SENDER_EMAIL."
        );
        return;
    }

    try {
        const response = await sendEmail({
            to: process.env.SENDER_EMAIL, // Send to self for testing
            subject: "Test Email from PingUp",
            body: "<h1>It Works!</h1><p>Your email configuration is correct.</p>",
        });
        console.log("✅ Email sent successfully!");
        console.log("Response:", response);
    } catch (error) {
        console.error("❌ Email failed to send.");
        console.error("Error details:", error);
    }
};

testEmail();
