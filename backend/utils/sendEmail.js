const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Fallback logging for local testing without mail keys
  if (!emailUser || emailUser.includes("your_email") || !emailPass || emailPass.includes("your_password")) {
    console.log("====================================");
    console.log(`[EMAIL SIMULATION]`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY: ${text}`);
    console.log("====================================");
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"Farmify" <${emailUser}>`,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    // Return true in development to avoid blocking user flow
    console.log(`[EMAIL FALLBACK LOGGER] TO: ${to} | SUBJECT: ${subject} | MSG: ${text}`);
    return true;
  }
};

module.exports = sendEmail;
