import nodemailer from 'nodemailer';

export const sendOTP = async (email: string, otp: string) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Safe Haven Map" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Safe Haven Verification Code',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <h2 style="color: #333;">Welcome to Safe Haven Map!</h2>
          <p>Please use the following OTP to verify your email address:</p>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
